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

function play (input, state, output, services) {
  state.set(['recorder', 'isPlaying'], true);

  // First argument is duration
  services.recorder.seek(0);
  services.recorder.play();
}

const playClicked = [
  play
];

controller.signal('playClicked', playClicked);

function record (input, state, output, services) {
  state.merge('recorder', {
    isRecording: true,
    hasRecorded: true
  });
  services.recorder.record();
}

const recordClicked = [
  record
];

controller.signal('recordClicked', recordClicked);

function stop (input, state, output, services) {
  state.merge('recorder', {
    isRecording: false,
    isPlaying: false
  });
  services.recorder.stop();
}

const stopClicked = [
  stop
];

controller.signal('stopClicked', stopClicked);
```

*App.js*
```javascript

import React from 'react';
import {Decorator as Cerebral} from 'cerebral-react';

@Cerebral({
  recorder: ['recorder'],
  value: ['inputValue']
})
class Recorder extends React.Component {
  render() {
    return (
      <div>
        {
          this.props.recorder.isRecording ?
            <button className="btn btn-stop" onClick={() => this.props.signals.stopClicked()}>Stop</button>
          :
          null
        }
        {
          this.props.recorder.isPlaying ?
            <button className="btn btn-play" disabled>Play</button>
          :
            null
        }
        {
          !this.props.recorder.isRecording && !this.props.recorder.isPlaying && this.props.recorder.hasRecorded ?
            <button className="btn btn-play" onClick={() => this.props.signals.playClicked()}>Play</button>
          :
            null
        }
        {
          !this.props.recorder.isRecording && !this.props.recorder.isPlaying && !this.props.recorder.hasRecorded ?
            <button className="btn btn-record" onClick={() => this.props.signals.recordClicked()}>Record</button>
          :
            null
        }
        <input value={this.props.value} onChange={(e) => this.props.signals.valueChanged.sync({value: e.target.value})}
      </div>
    )
  }
}
```

### Save recording to server

The recording is available on `services.recorder.getRecording()`. You can save this to the server and use `services.recorder.loadRecording(recording)` to load a recording.
