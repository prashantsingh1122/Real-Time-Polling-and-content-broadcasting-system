// import the http module
import http from 'k6/http';
import {check,sleep} from 'k6';

export const options = {
    stages:[
        {duration:'30s',target:5},  // ramp up to 5 fake users
        { duration: '30s', target: 5 },   // hold steady at 5 users
        { duration: '10s', target: 0 },   // ramp down
     ],
};

const payload =JSON.stringify({  //turn this JavaScript object into a plain text string.
    email: 'john@school.com',
    password: 'password123'

    // the server expects the request body as text
    // this makes the data easy to send over the internet
});

const params={
    headers: {
        'Content-Type': 'application/json'
    }
};
export default function(){
    const res = http.post('http://localhost:3000/api/auth/login', payload, params);

    check (res,{
        'status is 200': (r) => r.status === 200,
        'has token': (r) => JSON.parse(r.body).token !== undefined, 
    });
    sleep(1);
}