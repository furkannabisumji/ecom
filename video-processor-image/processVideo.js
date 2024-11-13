import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@aws-sdk/util-stream-node';

const execAsync = promisify(exec);

 const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const r2 = new S3Client({
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.R2_ENDPOINT
});

const downloadVideo = async ()=>{

    const { Body } = await s3.send(new GetObjectCommand(
      {
        Bucket: process.env.TEMP_BUCKET,
        Key: `${process.env.KEY}/input.mp4`, 
      }
    ));

    const readableStream = sdkStreamMixin(Body);

    const writableStream =  fs.createWriteStream(path.join(`./output/raw/${process.env.KEY}`, 'input.mp4'));

    readableStream.pipe(writableStream);

    await new Promise((resolve, reject) => {
        writableStream.on('error', reject);
        writableStream.on('finish', resolve);
    });

    console.log('File downloaded successfully!');    
}

const uploadVideo = async (output) => { 
  console.log(`Uploading ${output}...`);
  await r2.send(new PutObjectCommand(
    {
      Bucket: process.env.BUCKET,
      Key: output.slice(1),
      Body: fs.createReadStream(path.join('./output', output)),
    }
  ));
}

const processVideo = async () => {
  const baseDir = path.join('./output');
  const key = process.env.KEY;
  
  fs.mkdirSync(path.join(baseDir, 'raw', key), { recursive: true });
  fs.mkdirSync(path.join(baseDir, 'formats', key), { recursive: true });
  fs.mkdirSync(path.join(baseDir, 'hls', key), { recursive: true });

  await downloadVideo();
  await uploadVideo(`/raw/${key}/input.mp4`);

  const formats = [
    { bitrate: '500k', resolution: '426x240', output: 'output_500k_240p.mp4' },
    { bitrate: '1000k', resolution: '640x360', output: 'output_1000k_360p.mp4' },
    { bitrate: '1500k', resolution: '854x480', output: 'output_1500k_480p.mp4' },
    { bitrate: '2500k', resolution: '1280x720', output: 'output_2500k_720p.mp4' },
    { bitrate: '4000k', resolution: '1920x1080', output: 'output_4000k_1080p.mp4' }
  ];

  for (const { bitrate, resolution, output } of formats) {
    console.log(`Encoding video at ${bitrate}, resolution ${resolution}...`);
    
    await execAsync(`ffmpeg -i ${baseDir}/raw/${key}/input.mp4 -c:v libx264 -preset fast -b:v ${bitrate} -s ${resolution} -c:a aac -b:a 128k ${baseDir}/formats/${key}/${output}`);
    await uploadVideo(`/formats/${key}/${output}`);

    await execAsync(`ffmpeg -i ${baseDir}/formats/${key}/${output} -c:v libx264 -c:a aac -f hls -hls_time 10 -hls_list_size 0 -hls_segment_filename '${baseDir}/hls/${key}/segment_%03d.ts' ${baseDir}/hls/${key}/playlist.m3u8`);
    await uploadVideo(`/hls/${key}/playlist.m3u8`);
  }

    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.TEMP_BUCKET,
      Key: `${key}/input.mp4`
    }));

};

processVideo();