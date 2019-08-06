//
//  KYTestConfig.m
//  KouyuDemo
//
//  Created by Attu on 2017/8/28.
//  Copyright © 2017年 Attu. All rights reserved.
//

#import "KYTestConfig.h"

@implementation KYTestConfig

//初始化默认参数
- (instancetype)init {
    self = [super init];
    if (self) {
        self.userId = @"user-id";

        self.phonemeOption = KYPhonemeOption_KK;
        self.audioType = @"wav";
        self.channel = 1;
        self.sampleRate = 16000;
        self.sampleBytes = 2;
        self.recordPath = [NSString stringWithFormat:@"%@/Documents/record", NSHomeDirectory()];
        self.phoneme_output = YES;
    }
    return self;
}

@end
