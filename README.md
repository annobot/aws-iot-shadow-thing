# AWS IoT Two-Way Shadow Sync

This project demonstrates a two-way communication pattern between a **device client** and a **cloud application** using AWS IoT Thing Shadows. It simulates a smart light that can be controlled via the cloud by updating its brightness level. The device reads and reports its state accordingly, even across disconnections.

---

## 📁 Project Structure

```
.
├── cloudapplication
│   └── index.js            # CLI for cloud-side desired state updates
├── config
│   └── index.js            # AWS IoT Core client configuration
├── constants
│   └── index.js            # Constants like THING_NAME
├── device
│   └── index.js            # Device that reacts to desired state & reports back
├── .env                    # Environment variables
└── package.json
```

---

## ✅ Features

- Syncs **desired** and **reported** states of an AWS IoT Thing using Shadows
- Uses `delta` events to react to cloud-side changes
- Maintains a **local state** in memory (can be extended to persistent storage)
- Simulates **offline device behavior** and re-syncs on reconnect
- CLI-based control of brightness value from the cloud application

---

## 🛠 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create `.env` File

```
AWS_IOT_PRIVATE_KEY=./certs/private.key
AWS_IOT_CERTIFICATE=./certs/certificate.pem
AWS_IOT_CA=./certs/rootCA.pem
AWS_IOT_HOST=your-endpoint.iot.us-east-1.amazonaws.com
```

### 3. Configure Clients

Edit `config/index.js`:

```js
const deviceClientConfig = {
  keyPath: process.env.AWS_IOT_PRIVATE_KEY,
  certPath: process.env.AWS_IOT_CERTIFICATE,
  caPath: process.env.AWS_IOT_CA,
  clientId: 'temperaturesensor',
  host: process.env.AWS_IOT_HOST,
};

const cloudClientConfig = {
  keyPath: process.env.AWS_IOT_PRIVATE_KEY,
  certPath: process.env.AWS_IOT_CERTIFICATE,
  caPath: process.env.AWS_IOT_CA,
  clientId: 'cloud',
  host: process.env.AWS_IOT_HOST,
};
```

---

## 🚀 Running the App

### 1. Start the Device

```bash
node device/index.js
```

### 2. Start the Cloud Application

```bash
node cloudapplication/index.js
```

You'll be prompted to enter brightness values between 0–100. The device will receive the change and update its reported state.

---

## 🔐 IAM Policy Example

Attach this policy to the IoT certificate used by your device and cloud apps (This is too open. not recommended. Not secure.):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:Publish",
        "iot:Receive",
        "iot:Subscribe",
        "iot:Connect",
        "iot:GetThingShadow",
        "iot:UpdateThingShadow"
      ],
      "Resource": "*"
    }
  ]
}
```

You can further restrict access by:
- Topic names (e.g. `arn:aws:iot:region:account-id:topic/temperaturesensor/*`)
- Thing name-specific shadows

---

## 📓 Notes

- The `device` maintains a local copy of the shadow state in memory.
- On reconnection, the device requests the shadow from AWS and compares against its local state.
- Only differences between `desired` and `reported` trigger `delta` updates.
- You can simulate disconnection with timers or real network drop.

---

## 🧼 Future Enhancements

- Persist `localState` in a file (optional)
- Add LED simulation / GUI for physical brightness
- Extend for multiple sensors or shadow types

---
