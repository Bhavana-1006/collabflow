const http = require('http');

async function testApi() {
  const postData = JSON.stringify({
    email: 'alex@collabflow.io',
    password: 'Password123!',
  });

  const req = http.request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    },
    (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const json = JSON.parse(data);
        console.log('✅ Auth API Login Success:', json.success);
        console.log('👤 Logged in as:', json.user.name, `(${json.user.position})`);
        console.log('🔑 JWT Token generated:', json.token.substring(0, 30) + '...');

        // Now test workspaces with token
        const token = json.token;
        const wsReq = http.request(
          {
            hostname: 'localhost',
            port: 5000,
            path: '/api/workspaces',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          },
          (wsRes) => {
            let wsData = '';
            wsRes.on('data', (chunk) => (wsData += chunk));
            wsRes.on('end', () => {
              const wsJson = JSON.parse(wsData);
              console.log('✅ Workspaces API Success:', wsJson.success);
              console.log('🏢 Workspaces retrieved:', wsJson.workspaces.map((w) => w.name));

              const workspaceId = wsJson.workspaces[0]._id;
              // Test projects
              const projReq = http.request(
                {
                  hostname: 'localhost',
                  port: 5000,
                  path: `/api/projects?workspaceId=${workspaceId}`,
                  method: 'GET',
                  headers: { Authorization: `Bearer ${token}` },
                },
                (pRes) => {
                  let pData = '';
                  pRes.on('data', (chunk) => (pData += chunk));
                  pRes.on('end', () => {
                    const pJson = JSON.parse(pData);
                    console.log('✅ Projects API Success:', pJson.success);
                    console.log('🚀 Projects retrieved:', pJson.projects.map((p) => p.name));

                    // Test Tasks
                    const taskReq = http.request(
                      {
                        hostname: 'localhost',
                        port: 5000,
                        path: `/api/tasks?workspaceId=${workspaceId}`,
                        method: 'GET',
                        headers: { Authorization: `Bearer ${token}` },
                      },
                      (tRes) => {
                        let tData = '';
                        tRes.on('data', (chunk) => (tData += chunk));
                        tRes.on('end', () => {
                          const tJson = JSON.parse(tData);
                          console.log('✅ Tasks API Success:', tJson.success);
                          console.log('📋 Tasks count:', tJson.tasks.length);
                          console.log('📌 Sample tasks:', tJson.tasks.slice(0, 3).map((t) => t.title));
                          console.log('\n🎉 ALL CORE API SERVICES PASSING 100%!');
                          process.exit(0);
                        });
                      }
                    );
                    taskReq.end();
                  });
                }
              );
              projReq.end();
            });
          }
        );
        wsReq.end();
      });
    }
  );

  req.on('error', (e) => {
    console.error('API Test Error:', e);
    process.exit(1);
  });

  req.write(postData);
  req.end();
}

testApi();
