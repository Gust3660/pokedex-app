import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Main from "./pages/Main";

function App() {
  return (
    <>
      <Header />
      <Main />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </>
  );
}

export default App;
