import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";

export const handler = async (event) => {
  const ecs = new ECSClient();
  const body = JSON.parse(event.Records[0].body);
  try {
    const response = await ecs.send(new RunTaskCommand({
      cluster: process.env.ECS_CLUSTER_NAME,
      taskDefinition: process.env.ECS_TASK_DEFINITION,
      launchType: 'FARGATE',
      overrides: {
        containerOverrides: [{
          name: 'video',
          environment: [
            { name: 'KEY', value: body.Records[0].s3.object.key } 
          ],
        }],
      },
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: process.env.SUBNETS.split(","),
          assignPublicIp: 'ENABLED',
        },
      },
    }));

    console.log(`ECS task started: ${JSON.stringify(response.tasks)}`);
    return { status: 'success' };
  } catch (error) {
    console.error('Error starting ECS task:', error);
    throw new Error('Failed to start ECS task');
  }
};
