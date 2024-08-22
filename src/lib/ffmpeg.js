import ffmpeg, { setFfmpegPath } from 'fluent-ffmpeg';
import { path } from '@ffmpeg-installer/ffmpeg';

setFfmpegPath(path);

export const Ffm = (arg) => {
  return new Promise((resolve, reject) => {
    console.log("from ffmpeg.js file= ", arg);
    ffmpeg(`${arg}`, { timeout: 432000 })
      .addOptions([
        '-profile:v baseline',
        '-level 3.0',
        '-start_number 0',
        '-hls_time 10',
        '-hls_list_size 0',
        '-f hls'
      ])
      .output('static/videos/output.m3u8')
      .on('end', () => {
        console.log('end', arg);
        resolve();
      })
      .on('error', (err) => {
        console.error('Error:', err);
        reject(err);
      })
      .run();
  });
};

export default { Ffm };