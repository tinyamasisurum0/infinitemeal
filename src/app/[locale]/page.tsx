'use client';

import AdvancedRecipeCraftingNew from '@/components/AdvancedRecipeCraftingNew';
import { withClientTranslations } from '@/components/withClientTranslations';

function Home() {
  return (
    <main className="min-h-screen p-0">
      <AdvancedRecipeCraftingNew />
    </main>
  );
}

// Export the component wrapped with the client translations HOC
export default withClientTranslations(Home); 