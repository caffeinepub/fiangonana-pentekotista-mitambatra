import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';

export const SECTIONS = [
  { id: 'sekoly-alahady', label: 'Sekoly Alahady', labelFr: 'École du Dimanche' },
  { id: 'tanora', label: 'Tanora', labelFr: 'Jeunesse' },
  { id: 'tanora-zokiny', label: 'Tanora Zokiny', labelFr: 'Jeunesse Aînée' },
  { id: 'dorkasy', label: 'Dorkasy', labelFr: 'Dorcas' },
  { id: 'barnabasy', label: 'Barnabasy', labelFr: 'Barnabas' },
  { id: 'komity', label: 'Komity', labelFr: 'Comité' },
] as const;

export type SectionId = typeof SECTIONS[number]['id'];

interface SectionContextValue {
  currentSection: SectionId | null;
  setSection: (sectionId: SectionId) => Promise<void>;
  getSectionLabel: (sectionId: SectionId) => string;
}

const SectionContext = createContext<SectionContextValue | undefined>(undefined);

export function SectionProvider({ children }: { children: ReactNode }) {
  const { data: profile } = useGetCallerUserProfile();
  const { mutateAsync: saveProfile } = useSaveCallerUserProfile();
  const [currentSection, setCurrentSection] = useState<SectionId | null>(null);

  useEffect(() => {
    if (profile?.section) {
      setCurrentSection(profile.section as SectionId);
    }
  }, [profile]);

  const setSection = async (sectionId: SectionId) => {
    setCurrentSection(sectionId);
    if (profile) {
      await saveProfile({
        ...profile,
        section: sectionId,
      });
    }
  };

  const getSectionLabel = (sectionId: SectionId) => {
    return SECTIONS.find(s => s.id === sectionId)?.label || sectionId;
  };

  return (
    <SectionContext.Provider value={{ currentSection, setSection, getSectionLabel }}>
      {children}
    </SectionContext.Provider>
  );
}

export function useSection() {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error('useSection must be used within SectionProvider');
  }
  return context;
}
