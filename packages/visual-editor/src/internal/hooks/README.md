# Hooks

## useReceiveMessage

A hook to receive a postMessage request, either in a parent window or an iframe. It is
the receiving end for both [useSendMessageToIFrame](#usesendmessagetoiframe) and
[useSendMessageToParent](#usesendmessagetoparent).
The eventHandler if fired when a message is received, which contains a payload and callback
function. The receiver can choose to do something with the payload as well as send a
status and payload back to the publisher.

#### Props:

| Name          | Type         | Usage                                                          |
| ------------- | ------------ | -------------------------------------------------------------- |
| messageName   | string       | The message name to listen on                                  |
| targetOrigins | string[]     | The origin urls the message can be posted to and received from |
| eventHandler  | EventHandler | The function that will be called when the event is triggered   |

#### Usage:

```tsx
useReceiveMessage("getEntityDocument", TARGET_ORIGINS, (send, payload) => {
  setEntityDocument(payload);
  send({
    status: "success",
    payload: { message: "getEntityDocument received" },
  });
});
```

### TARGET_ORIGINS

The list of default target origins you should be passing to the suite of useMessage hooks for
Visual Editor development.

## useSendMessageToIFrame

A hook that allows sending a postMessage from a parent window to an iframe. Additionally,
it listens for a response from the iframe (two way communication) to update its status.

#### Props

| Name          | Type                         | Usage                                                          |
| ------------- | ---------------------------- | -------------------------------------------------------------- |
| messageName   | string                       | The message name to listen on                                  |
| targetOrigins | string[]                     | The origin urls the message can be posted to and received from |
| iframeRef     | RefObject<HTMLIFrameElement> | A MutableRefObject to send postMessages to - usually an iFrame |

#### Usage

```tsx
const { sendToIFrame: sendStateToIFrame } = useSendMessageToIFrame(
  "getState",
  [targetOrigin],
  iFrame
);

sendSaveStateToIFrame({ payload: saveStateRes });
```

## useSendMessageToParent

A hook that allows sending a postMessage from an iframe to its parent window. Additionally,
it listens for a response from the parent (two way communication) to update its status.

#### Props

| Name          | Type     | Usage                                                          |
| ------------- | -------- | -------------------------------------------------------------- |
| messageName   | string   | The message name to listen on                                  |
| targetOrigins | string[] | The origin urls the message can be posted to and received from |

#### Usage

```tsx
const { sendToParent: iFrameLoaded } = useSendMessageToParent(
  "iFrameLoaded",
  TARGET_ORIGINS
);

iFrameLoaded({ payload: { message: "iFrame is loaded" } });
```
