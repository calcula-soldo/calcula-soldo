import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CalculatorView } from '@/components/calculator/CalculatorView'
import { ComparePanel } from '@/components/calculator/ComparePanel'
import { ScenarioTable } from '@/components/calculator/ScenarioTable'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container max-w-5xl py-6 sm:py-10 space-y-6 no-print">
        <Tabs defaultValue="calculadora" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-10">
            <TabsTrigger value="calculadora" className="text-xs sm:text-sm">
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="comparar" className="text-xs sm:text-sm">
              Comparar Postos
            </TabsTrigger>
            <TabsTrigger value="cenarios" className="text-xs sm:text-sm">
              Cenários de Reajuste
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculadora" className="animate-fade-in mt-0">
            <CalculatorView />
          </TabsContent>

          <TabsContent value="comparar" className="animate-fade-in mt-0">
            <ComparePanel />
          </TabsContent>

          <TabsContent value="cenarios" className="animate-fade-in mt-0">
            <ScenarioTable />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
