import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

const run = async () => {
  try {
    await client.connect();
    console.log('✅ Connected to Redis');

    await client.set('foo', 'bar');
    const value = await client.get('foo');
    console.log('🔍 foo:', value);

    await client.disconnect();
    console.log('🔌 Disconnected');
  } catch (err) {
    console.error('❗ Runtime Error:', err);
  }
};

run();
