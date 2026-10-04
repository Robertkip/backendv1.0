// rabbitmq/publisher.js (main backend)
import amqp from 'amqplib';

let channel = null;
let connection = null;

function getRabbitMQUrl() {
  const {
    RABBITMQ_HOST = '127.0.0.1',
    RABBITMQ_PORT = 5672,
    RABBITMQ_USER = 'guest',
    RABBITMQ_PASS = 'guest',
    RABBITMQ_VHOST = '/',
  } = process.env;

  return `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}:${RABBITMQ_PORT}${RABBITMQ_VHOST}`;
}

export const connectRabbitMQ = async (retries = 5) => {
  const url = getRabbitMQUrl();
  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();

    await channel.assertQueue(process.env.EMAIL_QUEUE, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'email-dlx',
        'x-dead-letter-routing-key': process.env.DEAD_LETTER_QUEUE,
        'x-message-ttl': 60000, 
      },
    });

    console.log('✅ RabbitMQ publisher connected and queue asserted');
    return channel;
  } catch (err) {
    if (retries > 0) {
      console.log(`⚠️ RabbitMQ connection failed. Retrying in 5s... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectRabbitMQ(retries - 1);
    }
    throw err;
  }
}

// Called while a request waits (signup, login OTP), so give up after one
// retry instead of the five used at startup.
export const publishEmailJob = async (emailData) => {
  if (!channel) await connectRabbitMQ(1);
  const message = Buffer.from(JSON.stringify(emailData));
  channel.sendToQueue(process.env.EMAIL_QUEUE, message, {
    persistent: true,
    contentType: 'application/json',
  });
}
