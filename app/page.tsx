import ConwayWrapper from './components/ConwayWrapper'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-serif">
      <header className="p-4 bg-black text-white">
        <h1 className="text-3xl font-bold "style={{ fontFamily: 'Calibre, sans-serif' }}>Conway&apos;s Game of Life</h1>
        <p className="text-md text-gray-300" style={{ fontFamily: 'Calibre, sans-serif' }}>
          3D cellular automaton with interactive controls
        </p>
      </header>
      
      <main className="flex-1">
        <ConwayWrapper />
      </main>
  
    </div>
  );
}
