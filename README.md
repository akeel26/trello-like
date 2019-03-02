# Trello-like Application

Sample project for a test

## Prerequisite

* JSON-SERVER [https://github.com/typicode/json-server](https://github.com/typicode/json-server)

## Install the Application

Clone the repo using the command below

    git clone https://github.com/akeel26/trello-like.git <folder-name>

Move to `data/` directory and run the below commands to install and run JSON-SERVER

	npm install -g json-server
	json-server --watch db.json

Available functions,

* display all columns with all cards
* create a new card
* modify a card
* delete a card
* add a column
* modify a column
* delete a column
* search for any keywords presents on one or multiple cards. The view shall update without reloading the whole page
* Drag and drop a card from one column to another