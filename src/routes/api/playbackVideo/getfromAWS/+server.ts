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

function findVideoFiles(cameraId, date, startTime, endTime, callback) {
    const datePrefix = `${cameraId}/${date}/`;
    s3.listObjectsV2({
        Bucket: bucketName,
        Prefix: datePrefix
    }, (err, data) => {
        if (err) {
            console.error('Error listing objects:', err);
            callback([]);
            return;
        }

        const matchingFiles = [];

        data.Contents.forEach(item => {
            const match = item.Key.match(/(\d{2}_\d{2})-(\d{2}_\d{2})/);
            if (match) {
                const folderStartTime = match[1].replace('_', ':');
                const folderEndTime = match[2].replace('_', ':');

                if (isTimeRangeOverlap(startTime, endTime, folderStartTime, folderEndTime)) {
                    matchingFiles.push(item.Key);
                }
            }
        });

        callback(matchingFiles);
    });
}

function isTimeRangeOverlap(startTime, endTime, folderStartTime, folderEndTime) {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const [folderStartHours, folderStartMinutes] = folderStartTime.split(':').map(Number);
    const [folderEndHours, folderEndMinutes] = folderEndTime.split(':').map(Number);

    const start = startHours * 60 + startMinutes;
    const end = endHours * 60 + endMinutes;
    const folderStart = folderStartHours * 60 + folderStartMinutes;
    const folderEnd = folderEndHours * 60 + folderEndMinutes;

    // Check if the time ranges overlap
    return !(end <= folderStart || start >= folderEnd);
}
function createSignedUrl(filePath) {
    const cloudFrontBaseUrl = 'https://d1sve0q22m72ia.cloudfront.net';
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
    // const { cameraId, date, startTime, endTime } = await request.json();
    const data = await request.json();
    console.log(data)
    const cameraId = 'rn9k5cqzny2v6nn';
    const date = '2024_07_31';
    const startTime = '07:00';
    const endTime = '08:50'; 
    return new Promise((resolve) => {
        findVideoFiles(cameraId, date, startTime, endTime, (matchingFiles) => {
            if (matchingFiles.length > 0) {
                console.log("Matching video files =", matchingFiles);
                const signedUrls = matchingFiles.map(file => createSignedUrl(file));
                console.log("Signed URLs =", signedUrls);
                resolve(json({ files: signedUrls }));
            } else {
                resolve(json({ error: 'No video files found for the given time range.' }, { status: 500 }));
            }
        });
    });
};
