import ConwayWrapper from './components/ConwayWrapper'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-serif">
      <header className="p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-bold">Conway&apos;s Game of Life</h1>
        <p className="text-sm text-gray-300">
          3D cellular automaton with interactive controls
        </p>
      </header>
      
      <main className="flex-1">
        <ConwayWrapper />
      </main>
  
    </div>
  );
}
