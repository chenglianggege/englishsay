//
//  KYNativeAudio.h
//  KouyuDemo
//
//  Created by Attu on 2018/3/15.
//  Copyright © 2018年 Attu. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol KYNativeAudioDelegate

- (void)nativeAudioInputStream:(uint8_t[])audioBuffer bufferLength:(int)length;

- (void)nativeAudioFinishInputStream;

@end

@interface KYNativeAudio : NSObject

@property (nonatomic, weak) id<KYNativeAudioDelegate> delegate;

- (void)feedAudioDataWith:(NSString *)audioPath;

@end
