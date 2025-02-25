import ConwayWrapper from './components/ConwayWrapper'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-gray-800 text-white">
        <h1 className="text-2xl font-bold">Conway&apos;s Game of Life - 3D Edition</h1>
        <p className="text-sm text-gray-300">
          3D cellular automaton with interactive controls
        </p>
      </header>
      
      <main className="flex-1">
        <ConwayWrapper />
      </main>
      
      <footer className="p-4 bg-gray-800 text-white text-sm text-center">
        <p>
          Conway&apos;s Game of Life in 3D using Next.js, Three.js, and React Three Fiber
        </p>
      </footer>
    </div>
  );
}
