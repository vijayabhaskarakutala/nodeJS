const https = require('https');

const USERS_URL = 'https://api.github.com/users';

function requestUsersCallback(url, callback) {
  const request = https.get(
    url,
    {
      headers: {
        'User-Agent': 'nodejs-demo-script',
        Accept: 'application/vnd.github+json',
      },
    },
    (response) => {
      let body = '';

      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          callback(new Error(`Request failed with status ${response.statusCode}`));
          return;
        }

        try {
          callback(null, JSON.parse(body));
        } catch (error) {
          callback(error);
        }
      });
    }
  );

  request.on('error', (error) => {
    callback(error);
  });
}

function requestUsersPromise(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent': 'nodejs-demo-script',
            Accept: 'application/vnd.github+json',
          },
        },
        (response) => {
          let body = '';

          response.on('data', (chunk) => {
            body += chunk;
          });

          response.on('end', () => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
              reject(new Error(`Request failed with status ${response.statusCode}`));
              return;
            }

            try {
              resolve(JSON.parse(body));
            } catch (error) {
              reject(error);
            }
          });
        }
      )
      .on('error', reject);
  });
}

async function requestUsersAsyncAwait(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'nodejs-demo-script',
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function printUsers(label, users) {
  console.log(`\n=== ${label} ===`);
  console.log(`Total users: ${users.length}`);
  users.slice(0, 5).forEach((user, index) => {
    console.log(`${index + 1}. ${user.login} - ${user.html_url}`);
  });
}

function runCallbackExample() {
  return new Promise((resolve, reject) => {
    requestUsersCallback(USERS_URL, (error, users) => {
      if (error) {
        reject(error);
        return;
      }

      printUsers('Callback Way', users);
      resolve();
    });
  });
}

async function main() {
  try {
    await runCallbackExample();

    const promiseUsers = await requestUsersPromise(USERS_URL);
    printUsers('Promise Way', promiseUsers);

    const asyncUsers = await requestUsersAsyncAwait(USERS_URL);
    printUsers('Async/Await Way', asyncUsers);
  } catch (error) {
    console.error('Failed to fetch GitHub users:', error.message);
    process.exitCode = 1;
  }
}

main();