//
//  KYNativeAudio.m
//  KouyuDemo
//
//  Created by Attu on 2018/3/15.
//  Copyright © 2018年 Attu. All rights reserved.
//

#import "KYNativeAudio.h"

@interface KYNativeAudio()<NSStreamDelegate>

@end

@implementation KYNativeAudio

- (void)feedAudioDataWith:(NSString *)audioPath {
    NSInputStream *inputStream = [[NSInputStream alloc] initWithFileAtPath:audioPath];
    inputStream.delegate = self;
    [inputStream scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSRunLoopCommonModes];
    [inputStream open];
}

- (void)stream:(NSStream *)aStream handleEvent:(NSStreamEvent)eventCode {
    switch (eventCode) {
        case NSStreamEventHasBytesAvailable:{ // 读
            uint8_t buf[1024];
            NSInputStream *reads = (NSInputStream *)aStream;
            NSInteger blength = [reads read:buf maxLength:sizeof(buf)];
            if (blength != 0) {
                [self.delegate nativeAudioInputStream:buf bufferLength:(int)blength];
            } else {
                [aStream close];
                [self.delegate nativeAudioFinishInputStream];
            }
            break;
        }
        case NSStreamEventErrorOccurred:{// 错误处理
            break;
        }
        case NSStreamEventEndEncountered: {
            [aStream close];
            [self.delegate nativeAudioFinishInputStream];
            break;
        }
        case NSStreamEventNone:{// 无事件处理
            break;
        }
        case  NSStreamEventOpenCompleted:{// 打开完成
            break;
        }
        default:
            break;
    }
}

@end
