//
//  RNSkegn.m
//  RNSkegn
//
//  Created by 乘凉GG on 2018/8/21.
//  Copyright © 2018年 乘凉GG. All rights reserved.
//

#import "RNSkegn.h"
#import <STKouyuEngine/STKouyuEngine.h>
#import <Foundation/Foundation.h>


@implementation RNSkegn{
  AVAudioRecorder* _recorder;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}
+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

// To export a module named CalendarManager
RCT_EXPORT_MODULE();

// This would name the module AwesomeCalendarManager instead
// RCT_EXPORT_MODULE(AwesomeCalendarManager);

RCT_EXPORT_METHOD(skegnNew:(NSString *)appKey
                  secretKey:(NSString *)secretKey
                  withCallback:(RCTResponseSenderBlock)callback)
{
    //配置初始化引擎参数
    KYStartEngineConfig *startEngineConfig = [[KYStartEngineConfig alloc] init];
    startEngineConfig.appKey = appKey;
    startEngineConfig.secretKey = secretKey;
    startEngineConfig.serverTimeout = 300.0f;
    
    [[KYTestEngine sharedInstance] initEngine:KY_CloudEngine startEngineConfig:startEngineConfig finishBlock:^(BOOL isSuccess) {
      callback(@[isSuccess ? @1 : @0]);
    }];
}

RCT_EXPORT_METHOD(skegnStart:(NSDictionary *) param resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {

  KYTestConfig *config = [[KYTestConfig alloc] init];
  
  NSString* coreType = param[@"coreType"] == nil ? @"" : param[@"coreType"];
  
  if ([coreType isEqualToString:@"word.eval"]) {
    config.coreType = KYTestType_Word;
  }
  if ([coreType isEqualToString:@"sent.eval"]) {
    config.coreType = KYTestType_Sentence;
  }
  if ([coreType isEqualToString:@"para.eval"]) {
    config.coreType = KYTestType_Paragraph;
  }
  if ([coreType isEqualToString:@"open.eval"]) {
    config.coreType = KYTestType_Open;
  }
  if ([coreType isEqualToString:@"choice.rec"]) {
    config.coreType = KYTestType_Choice;
  }
  UInt32 getParam = param[@"getParam"] == nil ? 1 : [param[@"getParam"] unsignedIntValue];
  config.getParam = getParam == 0 ? NO : YES;
  config.refText = param[@"refText"] == nil ? @"" : param[@"refText"];
  UInt32 attachAudioUrl = param[@"attachAudioUrl"] == nil ? 1 : [param[@"attachAudioUrl"] unsignedIntValue];
  config.attachAudioUrl = attachAudioUrl == 0 ? NO : YES;
  UInt32 isParagraphNeedWordScore = param[@"paragraph_need_word_score"] == nil ? 1 : [param[@"paragraph_need_word_score"] unsignedIntValue];
  config.isParagraphNeedWordScore = isParagraphNeedWordScore == 0 ? NO : YES;
  NSString* dict_type = param[@"dict_type"] == nil ? @"KK" : param[@"dict_type"] ;
  if ([dict_type isEqualToString:@"KK"]) {
    config.phonemeOption = KYPhonemeOption_KK;
  }
  if ([dict_type isEqualToString:@"CMU"]) {
    config.phonemeOption = KYPhonemeOption_CMU;
  }
  if ([dict_type isEqualToString:@"IPA88"]) {
    config.phonemeOption = KYPhonemeOption_IPA88;
  }
  
  UInt32 phoneme_output = param[@"phoneme_output"] == nil ? 1 : [param[@"phoneme_output"] unsignedIntValue];
  config.phoneme_output = phoneme_output == 0 ? NO : YES;
  
  UInt32 agegroup = param[@"agegroup"] == nil ? 3 : [param[@"agegroup"] unsignedIntValue];
  config.ageGroup = agegroup;
  
  config.slack = param[@"slack"] == nil ? 0 : [param[@"slack"] floatValue];
  config.keywords = param[@"keywords"] == nil ? @"" : param[@"keywords"];
  config.scale = param[@"scale"] == nil ? 100 : [param[@"scale"] floatValue];
  config.precision = param[@"precision"] == nil ? 1 : [param[@"precision"] floatValue];
  config.qType = param[@"qType"] == nil ? 0 : [param[@"qType"] floatValue];
  
  config.audioPath = param[@"recordFilePath"] == nil ? @"" : param[@"recordFilePath"];
  config.userId = param[@"userId"] == nil ? @"userId" : param[@"userId"];

  
  NSString* mode = param[@"mode"] == nil ? @"school" : param[@"mode"];
  if ([mode isEqualToString:@"school"]) {
    config.mode = KYModeType_School;
  }
  if ([mode isEqualToString:@"home"]) {
    config.mode = KYModeType_Home;
  }
  //config.customParams = 1;
  
  NSString* startResult = [[KYTestEngine sharedInstance] startEngineWithTestConfig:config result:^(NSString *testResult) {
    //resultCallback(@[testResult]);
    if([config.audioPath length] == 0){
      [self sendEventWithName:@"onScore" body:testResult];
    }else{
      resolve(testResult);
    }
    
  }];
  if (startResult == nil) {
    reject(@"skegnStartFail", @"startResult false", nil);
    return;
  }
  
  if([config.audioPath length] == 0){
    resolve([NSNull null]);
  }

  //startCallback(@[startResult == nil ? @0 : @1]);
}

RCT_EXPORT_METHOD(skegnStop) {
    [[KYTestEngine sharedInstance] stopEngine];
}

RCT_EXPORT_METHOD(skegnCancel) {
    [[KYTestEngine sharedInstance] cancelEngine];
}

RCT_EXPORT_METHOD(skegnDelete) {
    [[KYTestEngine sharedInstance] deleteEngine];
}
RCT_EXPORT_METHOD(skegnPlayBack) {
  [[KYTestEngine sharedInstance] playback];
}

RCT_EXPORT_METHOD(startRecord:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if(_recorder && _recorder.isRecording) {
    reject(@"already_recording", @"Already Recording", nil);
    return;
  }
  NSMutableDictionary* settings = [self recordSetting];
  NSError* err = nil;
  AVAudioSession* session = [AVAudioSession sharedInstance];
  [session setCategory:AVAudioSessionCategoryRecord error:&err];
  if (err) {
    reject(@"init_session_error", [[err userInfo] description], err);
    return;
  }
  NSFileManager *fileManager = [NSFileManager defaultManager];
  NSString *recordPath = [NSString stringWithFormat:@"%@/Documents", NSHomeDirectory()];
  if (![fileManager fileExistsAtPath:recordPath]) {
    [fileManager createDirectoryAtPath:recordPath withIntermediateDirectories:YES attributes:nil error:nil];
  }
  NSString *wavFile = [NSString stringWithFormat:@"%@.wav", [self createUUID]];
  NSString *wavPath = [NSString stringWithFormat:@"%@/%@", recordPath, wavFile];
  NSURL *url = [NSURL fileURLWithPath:wavPath];
  
  _recorder = [[AVAudioRecorder alloc] initWithURL:url settings:settings error:&err];
  _recorder.delegate = self;
  
  if (err) {
    reject(@"init_recorder_error", [[err userInfo] description], err);
    return;
  }
  
  [_recorder prepareToRecord];
  [_recorder record];
  [session setActive:YES error:&err];
  
  if (err) {
    reject(@"session_set_active_error", [[err userInfo] description], err);
    return;
  }
  
  if(_recorder.isRecording) {
    resolve( [NSString stringWithFormat:@"/%@", wavFile]);
  } else {
    reject(@"recording_failed", [@"Cannot record audio at path: " stringByAppendingString:[_recorder url].absoluteString], nil);
  }
  
  
}
RCT_EXPORT_METHOD(stopRecord) {
  if(!_recorder) {
    return;
  }
  NSError* err = nil;
  
  [_recorder stop];
  
  // prepare the response
  NSString* url = [_recorder url].absoluteString;
  url = [url substringFromIndex:NSMaxRange([url rangeOfString:@"://"])]; // trim the scheme (file://)

  _recorder = nil; // release it
  
  AVAudioSession* session = [AVAudioSession sharedInstance];
  [session setActive:NO error:&err];
  
  if (err) {
    return;
  }
  
  [session setCategory:AVAudioSessionCategoryPlayback error:&err];
  
  if (err) {
    return;
  }
  
}
RCT_EXPORT_METHOD(checkPermissionIOS:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  
  //__block BOOL bCanRecord = YES;
  AVAuthorizationStatus authStatus = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeAudio];
  if (authStatus == AVAuthorizationStatusDenied) {
    resolve(@0);
  }else{
    resolve(@1);
  }
  
  /*
  if ([[[UIDevice currentDevice] systemVersion] compare:@"7.0"] != NSOrderedAscending)
  {
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    if ([audioSession respondsToSelector:@selector(requestRecordPermission:)]) {
      [audioSession performSelector:@selector(requestRecordPermission:) withObject:^(BOOL granted) {
        bCanRecord = granted;
      }];
    }
  }
  resolve(bCanRecord ? @"1" : @"0");
   */
}
RCT_EXPORT_METHOD(requestPermissionIOS) {
  [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]];
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"onScore"];
}
- (NSString *)createUUID
{
  CFUUIDRef uuidObject = CFUUIDCreate(kCFAllocatorDefault);
  NSString *uuidStr = (NSString *)CFBridgingRelease(CFUUIDCreateString(kCFAllocatorDefault, uuidObject));
  CFRelease(uuidObject);
  return uuidStr;
}

- (NSMutableDictionary *)recordSetting {
  NSMutableDictionary *recSetting = [[NSMutableDictionary alloc] init];
  // General Audio Format Settings
  recSetting[AVFormatIDKey] = @(kAudioFormatLinearPCM);
  recSetting[AVSampleRateKey] = @16000;
  recSetting[AVNumberOfChannelsKey] = @1;
  // Linear PCM Format Settings
  recSetting[AVLinearPCMBitDepthKey] = @16;
  recSetting[AVLinearPCMIsBigEndianKey] = @YES;
  recSetting[AVLinearPCMIsFloatKey] = @YES;
  // Encoder Settings
  recSetting[AVEncoderAudioQualityKey] = @(AVAudioQualityMedium);
  recSetting[AVEncoderBitRateKey] = @128000;
  return recSetting;
}

- (void)dealloc {
  
}
@end


