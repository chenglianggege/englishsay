//
//  KYTestEngine.m
//  KouyuDemo
//
//  Created by Attu on 2017/8/15.
//  Copyright © 2017年 Attu. All rights reserved.
//

#import "KYTestEngine.h"
#import "KYRecorder.h"
#import "KYNativeAudio.h"
#import "zlib.h"
#include "skegn.h"
#import <pthread.h>

//证书是否为新的
#define KY_isNew @"KY_isNew"
//保存序列号的Key
#define KY_SerialNumber @"KY_SerialNumber"

@interface NSMutableDictionary (Additional)

- (instancetype)setNotEmptyValue:(id)object forKey:(NSString *)key;

@end

@implementation NSMutableDictionary (Additional)

- (instancetype)setNotEmptyValue:(id)object forKey:(NSString *)key {
    
    if ([object isKindOfClass:[NSString class]]) {
        if ([object length] != 0) {
            [self setValue:object forKey:key];
        }
    } else if ([object isKindOfClass:[NSNumber class]]) {
        if ([object floatValue] != 0) {
            [self setValue:object forKey:key];
        }
    } else if ([object isKindOfClass:[NSDictionary class]]) {
        if ([object count] != 0) {
            [self setValue:object forKey:key];
        }
    } else if ([object isKindOfClass:[NSArray class]]) {
        if ([object count] != 0) {
            [self setValue:object forKey:key];
        }
    }
    
    return self;
}

@end

@interface KYTestEngine ()<KYRecorderDelegate, KYNativeAudioDelegate>

@property (nonatomic, assign) struct skegn *engine;

@property (nonatomic, strong) KYRecorder *recorder;

@property (nonatomic, strong) KYNativeAudio *nativeAudio;

@property (nonatomic, copy) NSString *serialNumber;

@property (nonatomic, assign) KYEngineType engineType;

@property (nonatomic, strong) KYStartEngineConfig *startEngineConfig;

@property (nonatomic, copy) KYTestResultBlock testResultBlock;

@property (nonatomic, strong) NSOperationQueue *queue;

@end

@implementation KYTestEngine
{
    pthread_mutex_t lock;
}

static int _skegn_callback(const void *usrdata, const char *id, int type, const void *message, int size)
{
    if (type == SKEGN_MESSAGE_TYPE_JSON) {
        /* received score result in json formatting */
        [(__bridge KYTestEngine *)usrdata performSelectorOnMainThread:@selector(showResult:) withObject:[[NSString alloc] initWithUTF8String:(char *)message] waitUntilDone:NO];
    }
    return 0;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        self.queue = [[NSOperationQueue alloc] init];
        self.queue.maxConcurrentOperationCount = 1;
        
        pthread_mutex_init(&lock, NULL);
    }
    return self;
}

#pragma mark - Init Method

+ (instancetype)sharedInstance {
    static KYTestEngine *engine;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        engine = [[KYTestEngine alloc] init];
    });
    return engine;
}

#pragma mark - Public Method

//初始化引擎
- (void)initEngine:(KYEngineType)engineType startEngineConfig:(KYStartEngineConfig *)startEngineConfig finishBlock:(void (^)(BOOL))finishBlock {
    self.startEngineConfig = startEngineConfig;
    self.engineType = engineType;
    
    if (startEngineConfig.isUpdateProvison) {  //更新证书
        [[NSUserDefaults standardUserDefaults] setObject:[NSNumber numberWithBool:NO] forKey:KY_isNew];
    }
    
    if (startEngineConfig.isUseOnlineProvison) {    //使用云端下载证书
        if (![self checkProvisionFile]) {
            finishBlock(NO);
            return;
        }
    }

    __weak typeof(self) weakSelf = self;
    NSBlockOperation *operation = [NSBlockOperation blockOperationWithBlock:^{
        if (weakSelf.engine != NULL) {
            [weakSelf deleteEngine];
        }
        
        char cfg[4096];
        strcpy(cfg, [self configInitEngineParamWith:startEngineConfig].UTF8String);
        weakSelf.engine = skegn_new(cfg);
        if (weakSelf.engine && startEngineConfig.isUseOnlineProvison) {
            [[NSUserDefaults standardUserDefaults] setObject:[NSNumber numberWithBool:YES] forKey:KY_isNew];
        }
        
        if (finishBlock) {
            if (weakSelf.engine) {
                finishBlock(YES);
            } else {
                finishBlock(NO);
            }
        }
    }];
    
    [self.queue addOperation:operation];
}

//开始评测
- (NSString *)startEngineWithTestConfig:(KYTestConfig *)testConfig result:(KYTestResultBlock)testResultBlock {
    int rv = 0;
    
    if (self.engine == NULL) {
        return nil;
    }
    
    char record_id[64] = {0};
    char param[4096];
 
    strcpy(param, [self configParamRequestWith:testConfig].UTF8String);
    
    rv = skegn_start(self.engine, param, record_id, (skegn_callback)_skegn_callback, (__bridge const void *)(self));
    if (rv) {
        printf("skegn_start() failed: %d\n", rv);
        return nil;
    }
    
    NSFileManager *fileManager = [NSFileManager defaultManager];

    if ([testConfig.audioPath length] != 0) {
        if (![fileManager fileExistsAtPath:testConfig.audioPath]) {
            NSLog(@"本地音频不存在");
            return nil;
        } else {
            self.nativeAudio = [[KYNativeAudio alloc] init];
            self.nativeAudio.delegate = self;
            [self.nativeAudio feedAudioDataWith:testConfig.audioPath];
        }
    } else {
        if (![fileManager fileExistsAtPath:testConfig.recordPath]) {
            [fileManager createDirectoryAtPath:testConfig.recordPath withIntermediateDirectories:YES attributes:nil error:nil];
        }
        
        self.recorder = [[KYRecorder alloc] init];
        self.recorder.delegate = self;
        NSString *wavPath;
        if ([testConfig.recordName length] != 0) {
            wavPath = [NSString stringWithFormat:@"%@/%@", testConfig.recordPath, testConfig.recordName];
        } else {
            wavPath = [NSString stringWithFormat:@"%@/%s.wav", testConfig.recordPath, record_id];
        }
        //NSString *wavPath = [NSString stringWithFormat:@"%@/%s.wav", testConfig.recordPath, record_id];
        
        rv = [self.recorder startReocrdWith:wavPath callbackInterval:100];
        
        if(rv != 0) {
            printf("airecorder_start() failed: %d\n", rv);
            return nil;
        }
    }
    
    self.testResultBlock = testResultBlock;
    
    return [NSString stringWithCString:record_id encoding:NSUTF8StringEncoding];
}

- (void)stopEngine {
    if (self.recorder) {
        [self.recorder stopRecorder];
    }
    if (self.engine) {
        skegn_stop(self.engine);
    }
}

- (void)cancelEngine {
    if (self.recorder) {
        [self.recorder stopRecorder];
    }
    if (self.engine) {
        skegn_cancel(self.engine);
    }
}

- (void)deleteEngine {
    pthread_mutex_lock(&lock);
    if (self.engine != NULL) {
        skegn_delete(self.engine);
        self.engine = nil;
    }
    if (self.recorder) {
        [self.recorder stopRecorder];
        self.recorder = nil;
    }
    
        pthread_mutex_unlock(&lock);
//    pthread_mutex_destroy(&lock);
}

- (void)playback {
    if (self.recorder == NULL) {
        return;
    }
    [self.recorder playback];
}

- (void)playWithPath:(NSString *)wavPath {
    [self.recorder playWithPath:wavPath];
}

#pragma mark - Delegate

- (void)recorderFeedAudioData:(const void *)audioData audioLength:(int)length {
    skegn_feed(self.engine, audioData, length);
}

- (void)nativeAudioInputStream:(uint8_t [])audioBuffer bufferLength:(int)length {
    skegn_feed(self.engine, audioBuffer, length);
}

- (void)nativeAudioFinishInputStream {
    [self stopEngine];
}

#pragma mark - Private Method

//配置启动引擎参数
- (NSString *)configInitEngineParamWith:(KYStartEngineConfig *)startEngineConfig {
    NSMutableDictionary *paramDic = [NSMutableDictionary dictionary];
    [paramDic setNotEmptyValue:startEngineConfig.appKey forKey:@"appKey"];
    [paramDic setNotEmptyValue:startEngineConfig.secretKey forKey:@"secretKey"];
    [paramDic setNotEmptyValue:startEngineConfig.provison forKey:@"provision"];
    
    if (self.engineType == KY_CloudEngine) {
        NSMutableDictionary *cloudDic = [NSMutableDictionary dictionary];
        [cloudDic setNotEmptyValue:[NSNumber numberWithInteger:startEngineConfig.enable] forKey:@"enable"];
        [cloudDic setNotEmptyValue:startEngineConfig.server forKey:@"server"];
        [cloudDic setValue:startEngineConfig.serverList forKey:@"serverList"];
        [cloudDic setValue:startEngineConfig.serverList forKey:@"sdkCfgAddr"];
        [cloudDic setNotEmptyValue:[NSNumber numberWithFloat:startEngineConfig.connectTimeout] forKey:@"connectTimeout"];
        [cloudDic setNotEmptyValue:[NSNumber numberWithFloat:startEngineConfig.serverTimeout] forKey:@"serverTimeout"];
        
        [paramDic setNotEmptyValue:cloudDic forKey:@"cloud"];
    } else {
//        NSDictionary *prof = @{@"enable" : @1,
//                               @"output" : @""};
//
//        [paramDic setNotEmptyValue:prof forKey:@"prof"];
        [paramDic setNotEmptyValue:startEngineConfig.native forKey:@"native"];
        [paramDic setNotEmptyValue:startEngineConfig.provison forKey:@"provision"];
        
        [self loadSerialNumber:startEngineConfig];
    }
    
    if (startEngineConfig.vadEnable) {
        NSDictionary *vadDic = @{
                                 @"enable":[NSNumber numberWithBool:YES],
                                 @"seek":[NSNumber numberWithFloat:startEngineConfig.seek]
                                 };
        [paramDic setNotEmptyValue:vadDic forKey:@"vad"];
    }

    if (startEngineConfig.sdkLogEnable) {
        NSDictionary *logDic = @{
                                 @"enable":[NSNumber numberWithBool:YES],
                                 @"output":[[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0] stringByAppendingPathComponent:@"sdkLog.txt"]
                                 };
        [paramDic setNotEmptyValue:logDic forKey:@"sdkLog"];
    }

    NSString *jsonString = [self objectToJsonString:paramDic];
    return jsonString;
}

//获取序列号
- (void)loadSerialNumber:(KYStartEngineConfig *)startEngineConfig {
    self.serialNumber = [[NSUserDefaults standardUserDefaults] objectForKey:KY_SerialNumber];
    if (!self.serialNumber) {
        // 离线内核需要获取serialNumber，需要保存为以后使用
        char serialbuf[1024] = {0};
        NSString *keyString = [NSString stringWithFormat:@"{\"appKey\":\"%@\", \"secretKey\":\"%@\"}", startEngineConfig.appKey, startEngineConfig.secretKey];
        strcpy(serialbuf, [keyString UTF8String]);
        skegn_opt(0, 6, serialbuf, sizeof(serialbuf));
        char *p = strstr(serialbuf, "serialNumber");
        char *p1 = NULL;
        if(p){
            p += strlen("serialNumber") + 3;
            p1 = strchr(p, '"');
            if(p1)*p1 = '\0';
            
            static char serialNumber[1024];
            strcpy(serialNumber, p);
            self.serialNumber = [NSString stringWithCString:serialNumber encoding:NSUTF8StringEncoding];
            [[NSUserDefaults standardUserDefaults] setObject:self.serialNumber forKey:KY_SerialNumber];
        } else {
            NSLog(@"获取序列号失败： %s", serialbuf);
        }
    }
}

//配置评测请求参数
- (NSString *)configParamRequestWith:(KYTestConfig *)testConfig {
    NSMutableDictionary *appDic = [NSMutableDictionary dictionary];
    [appDic setNotEmptyValue:testConfig.userId forKey:@"userId"];
    
    NSMutableDictionary *audioDic = [NSMutableDictionary dictionary];
    [audioDic setNotEmptyValue:testConfig.audioType forKey:@"audioType"];
    [audioDic setNotEmptyValue:[NSNumber numberWithInteger:testConfig.sampleRate] forKey:@"sampleRate"];
    [audioDic setNotEmptyValue:[NSNumber numberWithInteger:testConfig.channel] forKey:@"channel"];
    [audioDic setNotEmptyValue:[NSNumber numberWithInteger:testConfig.sampleBytes] forKey:@"sampleBytes"];
    [audioDic setNotEmptyValue:[NSNumber numberWithInteger:testConfig.quality] forKey:@"quality"];
    [audioDic setNotEmptyValue:[NSNumber numberWithInteger:testConfig.complexity] forKey:@"complexity"];
    [audioDic setNotEmptyValue:[self getCompressType:testConfig.compress] forKey:@"compress"];
    [audioDic setNotEmptyValue:[NSNumber numberWithInteger:testConfig.vbr] forKey:@"vbr"];
    
    NSMutableDictionary *requestDic = [NSMutableDictionary dictionary];
    [requestDic setNotEmptyValue:[NSNumber numberWithInteger:testConfig.getParam] forKey:@"getParam"];
    [requestDic setNotEmptyValue:[self getCoreType:testConfig.coreType] forKey:@"coreType"];
    [requestDic setNotEmptyValue:testConfig.refText forKey:@"refText"];
    [requestDic setNotEmptyValue:testConfig.refAudio forKey:@"refAudio"];
    [requestDic setNotEmptyValue:[NSNumber numberWithInteger:testConfig.attachAudioUrl] forKey:@"attachAudioUrl"];
    [requestDic setNotEmptyValue:[self getDicType:testConfig.phonemeOption] forKey:@"dict_type"];
    [requestDic setNotEmptyValue:[NSNumber numberWithInteger:testConfig.phoneme_output] forKey:@"phoneme_output"];
    [requestDic setNotEmptyValue:[NSNumber numberWithInteger:testConfig.ageGroup] forKey:@"agegroup"];
    [requestDic setNotEmptyValue:[NSNumber numberWithInteger:testConfig.isParagraphNeedWordScore] forKey:@"paragraph_need_word_score"];
    [requestDic setNotEmptyValue:[NSNumber numberWithFloat:testConfig.scale] forKey:@"scale"];
    [requestDic setNotEmptyValue:[NSNumber numberWithFloat:testConfig.precision] forKey:@"precision"];
    [requestDic setNotEmptyValue:[NSNumber numberWithFloat:testConfig.slack] forKey:@"slack"];
    [requestDic setNotEmptyValue:testConfig.keywords forKey:@"keywords"];
    [requestDic setNotEmptyValue:[NSNumber numberWithInteger:testConfig.qType] forKey:@"qType"];
    [requestDic setNotEmptyValue:testConfig.customized_lexicon forKey:@"customized_lexicon"];
    [requestDic setNotEmptyValue:[self getModeType:testConfig.mode] forKey:@"mode"];
    
    //自定义参数
    [requestDic addEntriesFromDictionary:testConfig.customParams];
    
    NSMutableDictionary *paramDic = [NSMutableDictionary dictionary];
    [paramDic setNotEmptyValue:[NSNumber numberWithInteger:testConfig.soundIntensityEnable] forKey:@"soundIntensityEnable"];
    [paramDic setNotEmptyValue:appDic forKey:@"app"];
    [paramDic setNotEmptyValue:audioDic forKey:@"audio"];
    [paramDic setNotEmptyValue:requestDic forKey:@"request"];
    
    if (self.engineType == KY_CloudEngine) {
        // 云端评分配置
        [paramDic setValue:@"cloud" forKey:@"coreProvideType"];
    } else {
        // 离线评分配置
        [paramDic setValue:@"native" forKey:@"coreProvideType"];
        [paramDic setNotEmptyValue:self.serialNumber forKey:@"serialNumber"];
    }
    
    NSString *jsonString = [self objectToJsonString:paramDic];
    return jsonString;
}

//回调评测结果
- (void)showResult:(NSString *)result {
    if ([result containsString:@"errId"]) {
        [self stopEngine];
    }
    if (_testResultBlock) {
        self.testResultBlock(result);
    }
}

- (BOOL)checkProvisionFile {
    BOOL isNew = [[[NSUserDefaults standardUserDefaults] objectForKey:KY_isNew] boolValue];
    if (!isNew) {
        //更新证书 -- KY
        return [self downloadProvision];
    }
    return YES;
}

// 下载证书
- (BOOL)downloadProvision {
    char serialbuf[1024] = {0};
    sprintf(serialbuf, "{\"appKey\":\"%s\", \"secretKey\":\"%s\"}", [self.startEngineConfig.appKey UTF8String], [self.startEngineConfig.secretKey UTF8String]);
    
    int opt = self.engineType == KY_NativeEngine ? 6 : 5;    //离线传6，在线传5
    
    skegn_opt(0, opt, serialbuf, sizeof(serialbuf));
    
    NSString *jsonString = [NSString stringWithCString:serialbuf encoding:NSUTF8StringEncoding];
    
    if ([jsonString containsString:@"error"] || [jsonString length] == 0 || ![jsonString containsString:@"provision"]) {
        NSLog(@"下载证书失败：%s", serialbuf);
        return NO;
    }
    
    
    NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *jsonDic = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:nil];
    
    //保存序列号
    NSString *serialNumber = [jsonDic objectForKey:@"serialNumber"];
    [[NSUserDefaults standardUserDefaults] setObject:serialNumber forKey:KY_SerialNumber];
    
    NSString *path = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0] stringByAppendingPathComponent:@"skegn.provision"];
    
    if(![[NSFileManager defaultManager] fileExistsAtPath:path]){
        [[NSFileManager defaultManager] createFileAtPath:path contents:nil attributes:nil];
    }
    //base64解码并写入文件
    NSString *provision = [jsonDic objectForKey:@"provision"];
    NSData *decodedData = [[NSData alloc] initWithBase64EncodedString:provision options:0];
    [decodedData writeToFile:path atomically:YES];
    
    return YES;
}

//字典、数组转换为JSON字符串
- (NSString *)objectToJsonString:(id)object {
    NSString *jsonString = nil;
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:object
                                                       options:NSJSONWritingPrettyPrinted
                                                         error:&error];
    if (!jsonData) {
        NSLog(@"Got an error: %@", error);
    } else {
        jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }
    return jsonString;
}

#pragma mark - 枚举转String

- (NSString *)getCoreType:(KYTestType)testType {
    NSString *coreType;
    switch (testType) {
        case KYTestType_Word:
            coreType = @"word.eval";
            break;
        case KYTestType_Sentence:
            coreType = @"sent.eval";
            break;
        case KYTestType_Paragraph:
            coreType = @"para.eval";
            break;
        case KYTestType_Open:
            coreType = @"open.eval";
            break;
        case KYTestType_Choice:
            coreType = @"choice.rec";
            break;
        case KYTestType_Asr:
            coreType = @"asr.rec";
            break;
        case KYTestType_Align:
            coreType = @"align.eval";
            break;
        case KYTestType_Word_Pro:
            coreType = @"word.eval.pro";
            break;
         case KYTestType_Sentence_Pro:
            coreType = @"sent.eval.pro";
            break;
        default:
            break;
    }
    return coreType;
}

- (NSString *)getDicType:(KYPhonemeOption)phonemeOption {
    NSString *dicType;
    switch (phonemeOption) {
        case KYPhonemeOption_KK:
            dicType = @"KK";
            break;
        case KYPhonemeOption_CMU:
            dicType = @"CMU";
            break;
        case KYPhonemeOption_IPA88:
            dicType = @"IPA88";
            break;
        default:
            break;
    }
    return dicType;
}

- (NSString *)getCompressType:(KYCompressType)compressType {
    NSString *compress;
    switch (compressType) {
        case KYCompress_Raw:
            compress = @"raw";
            break;
        case KYCompress_Speex:
            compress = @"speex";
            break;
        default:
            break;
    }
    return compress;
}

- (NSString *)getModeType:(KYModeType)modeType {
    NSString *mode;
    switch (modeType) {
        case KYModeType_School:
            mode = @"school";
            break;
        case KYModeType_Home:
            mode = @"home";
            break;
        default:
            break;
    }
    return mode;
}

@end
