import React, {createRef} from 'react';

class App extends React.Component {
  state = {
    color: 'red',
    colors:[
      'red',
      'blue',
      'green',
      'black',
      'yellow',
      'pink'
    ],
    username: 'Anonymous',
    circles: []
  };

  componentDidMount() {
    this.websocket = new WebSocket('ws://localhost:8000/circle');

    this.websocket.onmessage = (circle) => {
      try {
        const data = JSON.parse(circle.data);

        if (data.type === 'NEW_CIRCLE') {
          const newCircle= {
            username: data.username,
            circle: data.circle
          };

          this.setState({circles: [...this.state.circles, newCircle]});
          this.renderCircles();
        } else if (data.type === 'LAST_CIRCLES') {
          this.setState({circles: data.circles});
          this.renderCircles();
        }
      } catch (e) {
        console.log('Something went wrong', e);
      }
    };
  };

  renderCircles = () => {
    const canvas = this.canvas.current;

    const ctx = canvas.getContext('2d');

    this.state.circles.forEach(circle => {
      ctx.beginPath();
      ctx.arc(circle.circle.x, circle.circle.y, 50, 0, 2 * Math.PI);
      ctx.fillStyle = circle.circle.color;
      ctx.fill();
      ctx.stroke();
    })
  };

  sendCircle = circleObj => {

    const circle = {
      type: 'CREATE_CIRCLE',
      circle: circleObj
    };

    this.websocket.send(JSON.stringify(circle));
  };

  setUsername = e => {
    e.preventDefault();

    const message = {
      type: 'SET_USERNAME',
      username: this.state.username
    };

    this.websocket.send(JSON.stringify(message));
  };

  onCanvasClick = e => {
    e.persist();

    const canvas = this.canvas.current;

    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(e.clientX, e.clientY, 50, 0, 2 * Math.PI);
    ctx.fillStyle = this.state.color;
    ctx.fill();
    ctx.stroke();

    const obj = {
      x: e.clientX,
      y: e.clientY,
      color: this.state.color
    };

    this.sendCircle(obj);
  };

  canvas = createRef();

  changeField = e => this.setState({[e.target.name]: e.target.value});

  render() {
    return (
        <>
          <select name="color" id="color" onChange={this.changeField}>
            {this.state.colors.map(color => (
                <option key={color} value={color}>{color}</option>
            ))}
          </select>
          <form onSubmit={this.setUsername}>
            <input type="text" value={this.state.username} name="username" onChange={this.changeField} />
            <button type="submit">Set username!</button>
          </form>



          <canvas width={window.innerWidth} height={window.innerHeight} ref={this.canvas} onClick={this.onCanvasClick}/>
        </>
    );
  }
}

export default App;

