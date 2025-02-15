import { Routes, Route } from "react-router-dom"
import { Header } from "./components/Header"
import { VirtualTryOn } from "./pages/VirtualTryOn"
import { FabricToDesign } from "./pages/FabricToDesign"
import { ColorChange } from "./pages/ColorChange"
import { ChangeBackground } from "./pages/ChangeBackground"

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <Routes>
        <Route path="/" element={<VirtualTryOn />} />
        <Route path="/fabric-to-design" element={<FabricToDesign />} />
        <Route path="/color-change" element={<ColorChange />} />
        <Route path="/background" element={<ChangeBackground />} />
      </Routes>
    </div>
  )
}

export default App

