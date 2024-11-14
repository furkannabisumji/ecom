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
  },
});

const r2 = new S3Client({
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.R2_ENDPOINT,
});

const downloadVideo = async () => {
  const { Body } = await s3.send(new GetObjectCommand({
    Bucket: process.env.TEMP_BUCKET,
    Key: process.env.KEY,
  }));

  const readableStream = sdkStreamMixin(Body);
  const outputDir = path.join('./output/raw');
  fs.mkdirSync(outputDir, { recursive: true });
  const writableStream = fs.createWriteStream(path.join(outputDir, path.basename(process.env.KEY)));

  readableStream.pipe(writableStream);
  await new Promise((resolve, reject) => {
    writableStream.on('error', reject);
    writableStream.on('finish', resolve);
  });
  console.log('File downloaded successfully!');
};

const uploadVideo = async (output) => {
  console.log(`Uploading ${output}...`);
  await r2.send(new PutObjectCommand({
    Bucket: process.env.BUCKET,
    Key: output.slice(1),
    Body: fs.createReadStream(path.join('./output', output)),
  }));
};

const processVideo = async () => {
  const baseDir = path.join('./output');
  const key = process.env.KEY;
  const folder = process.env.KEY.split('/')[0];
  const fileName = path.basename(key);

  fs.mkdirSync(path.join(baseDir, 'raw'), { recursive: true });
  fs.mkdirSync(path.join(baseDir, 'formats', folder), { recursive: true });
  fs.mkdirSync(path.join(baseDir, 'hls', folder), { recursive: true });

  await downloadVideo();

  const formats = [
    { bitrate: '500k', resolution: '426x240', output: 'output_500k_240p.mp4' },
    { bitrate: '1000k', resolution: '640x360', output: 'output_1000k_360p.mp4' },
    { bitrate: '1500k', resolution: '854x480', output: 'output_1500k_480p.mp4' },
    { bitrate: '2500k', resolution: '1280x720', output: 'output_2500k_720p.mp4' },
    { bitrate: '4000k', resolution: '1920x1080', output: 'output_4000k_1080p.mp4' },
  ];

  let masterPlaylist = '#EXTM3U\n';

  for (const { bitrate, resolution, output } of formats) {
    console.log(`Encoding video at ${bitrate}, resolution ${resolution}...`);

    const formatOutputPath = path.join(baseDir, 'formats', folder, output);

    await execAsync(`ffmpeg -i ${baseDir}/raw/${fileName} -c:v libx264 -preset fast -b:v ${bitrate} -s ${resolution} -c:a aac -b:a 128k ${formatOutputPath}`);
    await uploadVideo(`/formats/${folder}/${output}`);

    const hlsOutputDir = path.join(baseDir, 'hls', folder, bitrate);
    fs.mkdirSync(hlsOutputDir, { recursive: true });

    const playlistPath = `${hlsOutputDir}/playlist.m3u8`;
    await execAsync(`ffmpeg -i ${formatOutputPath} -c:v libx264 -c:a aac -f hls -hls_time 10 -hls_list_size 0 -hls_segment_filename '${hlsOutputDir}/segment_%03d.ts' ${playlistPath}`);
    await uploadVideo(`/hls/${folder}/${bitrate}/playlist.m3u8`);

    masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${bitrate},RESOLUTION=${resolution}\n/hls/${folder}/${bitrate}/playlist.m3u8\n`;

    const files = fs.readdirSync(hlsOutputDir);
    for (const file of files) {
      if (file.endsWith('.ts')) {
        await uploadVideo(`/hls/${folder}/${bitrate}/${file}`);
      }
    }
  }

  const masterPlaylistPath = path.join(baseDir, 'hls', folder, 'master.m3u8');
  fs.writeFileSync(masterPlaylistPath, masterPlaylist);
  await uploadVideo(`/hls/${folder}/master.m3u8`);

  await uploadVideo(`/raw/${fileName}`);
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.TEMP_BUCKET,
    Key: key,
  }));
};

processVideo();
