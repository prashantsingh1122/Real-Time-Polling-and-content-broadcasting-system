import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  iterations: __ENV.VOTES ? parseInt(__ENV.VOTES) : 1000,
};

const POLL_ID = 'ad5481b4-02f1-4ef1-af6e-78fec87108aa';

export default function () {
  const voterSession = `test-voter-${__VU}-${__ITER}-${Date.now()}-${Math.random()}`;

  const payload = JSON.stringify({
    option_index: Math.floor(Math.random() * 2),
    voter_session: voterSession,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`http://localhost:3000/api/polls/${POLL_ID}/vote`, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(0.5);
}