//
//  KYRecorder.h
//  KouyuDemo
//
//  Created by Attu on 2017/12/26.
//  Copyright © 2017年 Attu. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol KYRecorderDelegate

- (void)recorderFeedAudioData:(const void *)audioData audioLength:(int)length;

@end

@interface KYRecorder : NSObject

@property (nonatomic, weak) id<KYRecorderDelegate> delegate;

- (int)startReocrdWith:(NSString *)wavPath callbackInterval:(NSInteger)interval;

- (void)pauseRecorder;

- (void)resumeRecorder;

- (void)stopRecorder;

- (void)playback;

- (void)playWithPath:(NSString *)wavPath;

@end
