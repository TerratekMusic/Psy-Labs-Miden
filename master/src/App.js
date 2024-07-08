// src/App.js
import React from "react";
import MidenApp from "./MidenApp";
import { ChakraProvider } from "@chakra-ui/react";

const App = () => {
  return (
    <ChakraProvider>
      <div className="App">
        <MidenApp />
      </div>
    </ChakraProvider>
  );
};

export default App;
