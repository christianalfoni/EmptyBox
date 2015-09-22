# Recording

You can record signals in Cerebral. There might be many different reasons to do this. One example is to help users navigate and use your application.

The recorder is exposed as a service. That means you have to create the signals and store the state you need to handle this. The demo application in the cerebral repo is an example of this.

*controller.js*
```javascript

import Controller from 'cerebral';
import Model from 'cerebral-baobab';

const model = Model({
  recorder: {
    isPlaying: false,
    isRecording: false,
    hasRecorded: false
  },
  inputValue: ''
});

export default Controller(model);
```

*main.js*
```javascript

import controller from './controller.js';

controller.signal('playClicked', function play (input, state, output, services) {
  state.set(['recorder', 'isPlaying'], true);

  // First argument is duration and second
  // is to start playing or not
  services.recorder.seek(0, true);
});

controller.signal('recordClicked', function record (input, state, output, services) {
  state.merge('recorder', {
    isRecording: true,
    hasRecorded: true
  });
  services.recorder.record();
});

controller.signal('stopClicked', function stop (input, state, output, services) {
  state.merge('recorder', {
    isRecording: false,
    isPlaying: false
  });
  services.recorder.stop();
});
```

*App.js*
```javascript

import {Component} from 'cerebral-react';

export default Component({
  recorder: ['recorder'],
  value: ['inputValue']
}, (props) => (

  <div>
    {
      props.recorder.isRecording ?
        <button className="btn btn-stop" onClick={() => props.signals.stopClicked()}>Stop</button>
      :
      null
    }
    {
      props.recorder.isPlaying ?
        <button className="btn btn-play" disabled>Play</button>
      :
        null
    }
    {
      !this.props.recorder.isRecording && !this.props.recorder.isPlaying && this.props.recorder.hasRecorded ?
        <button className="btn btn-play" onClick={() => props.signals.playClicked()}>Play</button>
      :
        null
    }
    {
      !this.props.recorder.isRecording && !this.props.recorder.isPlaying && !this.props.recorder.hasRecorded ?
        <button className="btn btn-record" onClick={() => props.signals.recordClicked()}>Record</button>
      :
        null
    }
    <input value={props.value} onChange={(e) => props.signals.valueChanged.sync({value: e.target.value})}
  </div>

));
```

### Save recording to server

The recording is available on `services.recorder.getRecording()`. You can save this to the server and use `services.recorder.loadRecording(recording)` to load a recording.
