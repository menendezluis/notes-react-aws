import React, { Component, useState} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import TextField from '@material-ui/core/TextField';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DeleteIcon from '@material-ui/icons/Delete'
import ListItemText from '@material-ui/core/ListItemText';

import Amplify from 'aws-amplify';
import { DataStore } from '@aws-amplify/datastore';
import { Note } from './models';

import { AmplifyAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import awsExports from "./aws-exports";

Amplify.configure(awsExports);

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

const classes= useStyles;
class Header extends Component {
  render() {
    return (
      <div>
        <header className="App-header">
          <h1 className="App-title">Notes App</h1>
        </header> 
        <AmplifySignOut />
      </div>
     
    )
  }
}

class AddNote extends Component {
  
  constructor(props) {
    super(props);
    this.state = { note: '' }
  }
  
  handleChange = (event) => {
    this.setState( { note: event.target.value } );
  }
  
  handleClick = (event) => {
    event.preventDefault();    

    // let the app manage the persistence & state 
    this.props.addNote( this.state ); 
    
    // reset the input text box value
    this.setState( { note: '' } );
  }
  
  render() {
    return (
      <div className="container p-3">
            <div className="input-group mb-3 p-3">
              <TextField className="w-100 inline-block" label="New Note" color="secondary" variant="outlined" value={ this.state.note } onChange={this.handleChange}/>
              
     
                <Button onClick={ this.handleClick } variant="contained" color="secondary">{ "Add Note" }</Button>
            </div>
        </div>  
    )
  }
}

class NotesList extends Component {
  
  render() {

    return (
      <React.Fragment>
        <div className="container">
          <List
          component="nav"
          aria-labelledby="nested-list-subheader"
          subheader={
            <ListSubheader component="div" id="nested-list-subheader">
              NestedListItems
            </ListSubheader>
          }
          className={classes.root}> 
        { this.props.notes.map( (note) => 
          <ListItem button>
            <ListItemText primary={note.note}></ListItemText>
            <ListItemIcon onClick={ (event) => { this.props.deleteNote(note) } }>
              <DeleteIcon />
            </ListItemIcon>        
          </ListItem>
        )}
         </List> 
        </div>
      </React.Fragment>
    )
  }   
}



class App extends Component {

  constructor(props) {
    super(props);
    this.state = { notes:[] }
  }

  async componentDidMount(){
    const notes = await DataStore.query(Note);
    this.setState( { notes: notes } )
  }  

  deleteNote = async (note) => {
    const modelToDelete = await DataStore.query(Note, note.id);
    DataStore.delete(modelToDelete);

    this.setState( { notes: this.state.notes.filter( (value, index, arr) => { return value.id !== note.id; }) } );
  }
  
  addNote = async (note) => {
    const result = await DataStore.save(
      new Note({
        "note": note.note
      })
    ); 
    this.state.notes.push(result)
    this.setState( { notes: this.state.notes } ) 
  }

  render() {
    return (
      <AmplifyAuthenticator>
       <div className="row">
        <div className="col m-3">
          <Header/>
          <AddNote addNote={ this.addNote }/>
          <NotesList notes={ this.state.notes } deleteNote={ this.deleteNote }/>
        </div> 
      </div> 
      </AmplifyAuthenticator>
    );
  }
}

export default App;
