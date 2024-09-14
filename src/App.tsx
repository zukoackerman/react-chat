import { BrowserRouter as Router, Routes, Route} from "react-router-dom";

import { QueryClient,QueryClientProvider } from "@tanstack/react-query";

import Home from "./screens/Home";

import ErrorBoundary from "./screens/auth/ErrorBoundary";

const MainLayout = () => {



  return (
    <Routes>
      <Route path="/" element={
        <ErrorBoundary>
          <Home />
        </ErrorBoundary>
      } />
     
    </Routes>
  );
};

const RootLayout = () => {
  const queryClient = new QueryClient();
  return (
   
        <QueryClientProvider client={queryClient}>
          <Router>
            <MainLayout />
          </Router>
        </QueryClientProvider>
 
  );
};

export default RootLayout;
