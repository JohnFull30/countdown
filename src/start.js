import react from "react";
import TextField from "@material-ui/core/TextField";
import "./Start.css";
import { Button, Container } from "@material-ui/core";
import { useState } from "react";
import { ReactDOM } from "react";

function Start() {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(name, duration);
  };

  return (
    <Container>
      <form className="Start" onSubmit={handleSubmit}>
        <TextField
          label="Message"
          color="secondary"
          variant="outlined"
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          onChange={(e) => setDuration(e.target.value)}
          label="Duration"
          color="secondary"
          variant="outlined"
          type="number"
        />
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </form>
    </Container>
  );
}

export default Start;
