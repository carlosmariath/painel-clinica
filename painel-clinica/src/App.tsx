import AppRoutes from "./routes";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Sidebar from "./components/Sidebar";

function App() {
  return <> <ThemeProvider theme={theme}><Sidebar /><AppRoutes /></ThemeProvider></>;
}

export default App;