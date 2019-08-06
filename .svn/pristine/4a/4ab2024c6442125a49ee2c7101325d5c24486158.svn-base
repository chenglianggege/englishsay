//
//  KYStartEngineConfig.m
//  KouyuDemo
//
//  Created by Attu on 2017/8/28.
//  Copyright © 2017年 Attu. All rights reserved.
//

#import "KYStartEngineConfig.h"

NSString *const KY_CloudServer_Gray = @"ws://gray.17kouyu.com:8090";

NSString *const KY_CloudServer_Release = @"ws://api.17kouyu.com:8080";

@implementation KYStartEngineConfig

//初始化默认参数
- (instancetype)init {
    self = [super init];
    if (self) {
        self.enable = YES;
        self.isUseOnlineProvison = NO;
        self.seek = 60;
        
        NSString *resourcePath = [[NSBundle mainBundle] pathForResource:@"STKouyuEngine" ofType:@"bundle"];
        self.native = [resourcePath stringByAppendingString:@"/native.res"];
    }
    return self;
}

- (void)setIsUseOnlineProvison:(BOOL)isUseOnlineProvison {
    _isUseOnlineProvison = isUseOnlineProvison;
    if (isUseOnlineProvison) {
        _provison = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0] stringByAppendingPathComponent:@"skegn.provision"];
    } else {
        NSString *resourcePath = [[NSBundle mainBundle] pathForResource:@"STKouyuEngine" ofType:@"bundle"];
        _provison = [resourcePath stringByAppendingString:@"/skegn.provision"];
    }
}


@end
