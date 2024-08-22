
// import { json } from '@sveltejs/kit';
// import AWS from 'aws-sdk';
// import fs from 'fs';
// import path from 'path';
// import type { RequestHandler } from './$types';
// import ffmpeg from 'fluent-ffmpeg';
// import { createHmac } from 'crypto';

// AWS.config.update({
//     accessKeyId: 'AKIA47CR3BSKZG4QG24Z',
//     secretAccessKey: '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',
// });

// const cloudFrontKeyPairId = 'YAKIA47CR3BSKZG4QG24Z';
// const cloudFrontPrivateKey = 'xJl/30tekLUP+RMTxxhZflxnA+lotmLLHCTmfIcu';
// const cloudFrontBaseUrl = 'https://d1sve0q22m72ia.cloudfront.net';

// const s3 = new AWS.S3();
// const bucketName = 'dev-realtime-video-streaming';

// function isTimeInRange(time: string, startTime: string, endTime: string): boolean {
//     const [tHours, tMinutes] = time.split(':').map(Number);
//     const [sHours, sMinutes] = startTime.split(':').map(Number);
//     const [eHours, eMinutes] = endTime.split(':').map(Number);

//     const inputTime = tHours * 60 + tMinutes;
//     const start = sHours * 60 + sMinutes;
//     const end = eHours * 60 + eMinutes;

//     return inputTime >= start && inputTime <= end;
// }

// function findVideoFile(cameraId, date, time, callback) {
//     const datePrefix = `${cameraId}/${date}/`;
//     s3.listObjectsV2({
//         Bucket: bucketName,
//         Prefix: datePrefix
//     }, (err, data) => {
//         if (err) {
//             console.error('Error listing objects:', err);
//             callback(null);
//             return;
//         }

//         const timeRangeFolder = data.Contents.find(item => {
//             const match = item.Key.match(/(\d{2}_\d{2})-(\d{2}_\d{2})/);
//             if (match) {
//                 const startTime = match[1].replace('_', ':');
//                 const endTime = match[2].replace('_', ':');
//                 return isTimeInRange(time, startTime, endTime);
//             }
//             return false;
//         });

//         if (timeRangeFolder) {
//             const playbackKey = `${timeRangeFolder.Key}`;
//             callback(playbackKey);
//         } else {
//             callback(null);
//         }
//     });
// }

// function createSignedUrl(filePath: string): string {
//     const expires = Math.floor((Date.now() / 1000) + 3600); 
//     const policy = {
//         Statement: [{
//             Resource: `${cloudFrontBaseUrl}/${filePath}`,
//             Condition: {
//                 DateLessThan: { 'AWS:EpochTime': expires }
//             }
//         }]
//     };
//     const policyString = JSON.stringify(policy);
//     const policyBase64 = Buffer.from(policyString).toString('base64');
//     const signature = createHmac('sha1', Buffer.from(cloudFrontPrivateKey, 'base64')).update(policyBase64).digest('base64');

//     return `${cloudFrontBaseUrl}/${filePath}?Policy=${encodeURIComponent(policyBase64)}&Signature=${encodeURIComponent(signature)}&Key-Pair-Id=${cloudFrontKeyPairId}`;
// }

// export const POST: RequestHandler = async ({ request }) => {
//     const { cameraId, date, startTime } = await request.json();
//     console.log(date, cameraId.id, startTime);
//     return new Promise((resolve) => {
//         findVideoFile(cameraId.id, date, startTime,async (playbackKey) => {
//             if (playbackKey) {
//                 console.log("playbackKey =", playbackKey);
//                 const signedUrl = createSignedUrl(playbackKey);
//                 console.log('Signed URL:', signedUrl);
//                 const baseDir = './static/videos';
//             const dateTimeDir = path.join(date, startTime);
//             const cameraDir = path.join(baseDir, cameraId.id, dateTimeDir);
//             const m3u8FileName = 'output.m3u8';
//             const outputPath = path.join(cameraDir, m3u8FileName);

//             if (!fs.existsSync(cameraDir)) {
//                 fs.mkdirSync(cameraDir, { recursive: true });
//             }

//             if (fs.existsSync(outputPath)) {
//                 fs.unlinkSync(outputPath);
//                 console.log(`Old file removed: ${outputPath}`);
//             }
//                 await Ffm(signedUrl, outputPath)
//                     .then(() => {
//                         console.log("FFmpeg conversion completed");
//                         resolve(json({ url: `/videos/${path.basename(outputPath)}` }));
//                     })
//                     .catch((error) => {
//                         console.error('FFmpeg error:', error);
//                         resolve(json({ error: 'FFmpeg conversion failed' }, { status: 500 }));
//                     });
//             } else {
//                 console.log('No video file found for the given time.');
//                 resolve(json({ error: 'No video file found for the given time.' }, { status: 404 }));
//             }
//         });
//     });
// };

// const Ffm = (inputPath: string, outputPath: string): Promise<void> => {
//     console.log(inputPath)
//     console.log(outputPath)
//     return new Promise((resolve, reject) => {
//         ffmpeg(inputPath, { timeout: 432000 })
//             .addOptions([
//                 '-profile:v baseline',
//                 '-level 3.0',
//                 '-start_number 0',
//                 '-hls_time 10',
//                 '-hls_list_size 0',
//                 '-f hls'
//             ])
//             .output(outputPath)
//             .on('end', () => {
//                 console.log('FFmpeg conversion ended');
//                 resolve();
//             })
//             .on('error', (err) => {
//                 console.error('FFmpeg error:', err);
//                 reject(err);
//             })
//             .run();
//     });
// };


import { json } from '@sveltejs/kit';
import AWS from 'aws-sdk';
import type { RequestHandler } from './$types';
import { createHmac } from 'crypto';

AWS.config.update({
    accessKeyId: 'AKIA47CR3BSKZG4QG24Z',
    secretAccessKey: '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',
});

const cloudFrontKeyPairId = 'YAKIA47CR3BSKZG4QG24Z';
const cloudFrontPrivateKey = 'xJl/30tekLUP+RMTxxhZflxnA+lotmLLHCTmfIcu';
const cloudFrontBaseUrl = 'https://d1sve0q22m72ia.cloudfront.net';

const s3 = new AWS.S3();
const bucketName = 'dev-realtime-video-streaming';

function isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    const [tHours, tMinutes] = time.split(':').map(Number);
    const [sHours, sMinutes] = startTime.split(':').map(Number);
    const [eHours, eMinutes] = endTime.split(':').map(Number);

    const inputTime = tHours * 60 + tMinutes;
    const start = sHours * 60 + sMinutes;
    const end = eHours * 60 + eMinutes;

    return inputTime >= start && inputTime <= end;
}

function findVideoFile(cameraId, date, time, callback) {
    const datePrefix = `${cameraId}/${date}/`;
    s3.listObjectsV2({
        Bucket: bucketName,
        Prefix: datePrefix
    }, (err, data) => {
        if (err) {
            console.error('Error listing objects:', err);
            callback(null);
            return;
        }

        const timeRangeFolder = data.Contents.find(item => {
            const match = item.Key.match(/(\d{2}_\d{2})-(\d{2}_\d{2})/);
            if (match) {
                const startTime = match[1].replace('_', ':');
                const endTime = match[2].replace('_', ':');
                return isTimeInRange(time, startTime, endTime);
            }
            return false;
        });

        if (timeRangeFolder) {
            const playbackKey = `${timeRangeFolder.Key}`;
            callback(playbackKey);
        } else {
            callback(null);
        }
    });
}

function createSignedUrl(filePath: string): string {
    const expires = Math.floor((Date.now() / 1000) + 3600);
    const policy = {
        Statement: [{
            Resource: `${cloudFrontBaseUrl}/${filePath}`,
            Condition: {
                DateLessThan: { 'AWS:EpochTime': expires }
            }
        }]
    };
    const policyString = JSON.stringify(policy);
    const policyBase64 = Buffer.from(policyString).toString('base64');
    const signature = createHmac('sha1', Buffer.from(cloudFrontPrivateKey, 'base64')).update(policyBase64).digest('base64');

    return `${cloudFrontBaseUrl}/${filePath}?Policy=${encodeURIComponent(policyBase64)}&Signature=${encodeURIComponent(signature)}&Key-Pair-Id=${cloudFrontKeyPairId}`;
}

export const POST: RequestHandler = async ({ request }) => {
    const { cameraId, date, startTime } = await request.json();
    return new Promise((resolve) => {
        findVideoFile(cameraId.id, date, startTime, (playbackKey) => {
            if (playbackKey) {
                const signedUrl = createSignedUrl(playbackKey);
                resolve(json({ url: signedUrl }));
            } else {
                resolve(json({ error: 'No video file found for the given time.' }, { status: 404 }));
            }
        });
    });
};
