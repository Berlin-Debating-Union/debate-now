import React, { Component } from 'react';
import update from 'react/lib/update';
import Card from './Card';
import { DropTarget } from 'react-dnd';
import '../stylesheets/Team.css'
import remove from 'lodash/remove';

class Team extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cards: props.users || [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if(JSON.stringify(this.props.users) !== JSON.stringify(nextProps.users)) {
      this.setState({
        cards: nextProps.users,
      });
    }
  }


  pushCard(card) {
    this.setState(update(this.state, {
      cards: {
        $push: [ card ]
      }
    }));
  }

  removeCard(index) {
    this.setState(update(this.state, {
      cards: {
        $splice: [
          [index, 1]
        ]
      }
    }));
  }

  moveCard(dragIndex, hoverIndex) {
    const { cards } = this.state;
    const dragCard = cards[dragIndex];

    this.setState(update(this.state, {
      cards: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard]
        ]
      }
    }));
  }

  deleteCard(id) {
    let newUsersArray = this.state.cards.slice();
    remove(newUsersArray, {id});
    this.setState({
      cards: newUsersArray,
    });
    this.props.deleteUser(id);
  }

  render() {
    const { cards, users } = this.state;
    const { canDrop, isOver, connectDropTarget } = this.props;
    const isActive = canDrop && isOver;

    const backgroundColor = isActive ? 'lightgreen' : 'rgba(0, 0, 0, 0.0)';

    return connectDropTarget(
      <div className={`team border--white ${ this.props.class }`} style={{backgroundColor}}>
        <h5>{this.props.position}</h5>
        {cards.map((card, i) => {
          return (
            <Card
              key={card.id}
              index={i}
              listId={this.props.id}
              card={card}
              users={users}
              removeCard={this.removeCard.bind(this)}
              moveCard={this.moveCard.bind(this)}
              deleteCard={this.deleteCard.bind(this)}/>
          );
        })}
      </div>
    );
  }
}

const cardTarget = {
  drop(props, monitor, component ) {
    const { id } = props;
    const sourceObj = monitor.getItem();
    if ( id !== sourceObj.listId ) component.pushCard(sourceObj.card);
    return {
      listId: id
    };
  }
};

export default DropTarget("CARD", cardTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(Team);
