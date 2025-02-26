import React from 'react'
import { Metadata } from 'next'
import content from './content.json'

export const metadata: Metadata = {
  title: content.metadata.title,
  description: content.metadata.description,
}

interface BulletPoint {
  text: string
  href?: string
}

interface Section {
  background?: string  // Made background optional
  title: string
  description?: string
  'bullet-points'?: Record<string, BulletPoint>
  href?: string
  [key: `section-${number}`]: Section
}

const TextWithUrls = ({ text }: { text: string }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const segments = []
  let lastIndex = 0
  let match

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      })
    }
    segments.push({
      type: 'url',
      content: match[0]
    })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex)
    })
  }

  return (
    <>
      {segments.map((segment, index) => (
        segment.type === 'url' ? (
          <a 
            key={index}
            href={segment.content}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {segment.content}
          </a>
        ) : (
          <span key={index}>{segment.content}</span>
        )
      ))}
    </>
  )
}

const SectionContent = ({
  section,
  level,
}: {
  section: Section
  level: number
}) => {
  type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  const Heading = `h${level}` as HeadingTag
  
  const hasCustomBackground = section.background && !section.background.includes('background.webp')
  
  return (
    <div 
      className={`p-6 bg-cover bg-center ${hasCustomBackground ? 'min-h-screen' : ''}`}
      style={{ backgroundImage: section.background ? `url(${section.background})` : undefined }}
    >
      <Heading className="text-4xl md:text-5xl font-bold mb-6">
        {section.title}
      </Heading>
      
      {section.description && (
        <p className="text-lg md:text-xl mb-8 max-w-prose">
          <span><TextWithUrls text={section.description} /></span>
        </p>
      )}
      
      {section['bullet-points'] && (
        <ul className="space-y-4 max-w-prose">
          {Object.values(section['bullet-points']).map((point, index) => (
            <li key={index} className="text-lg">
              <span>{point.text} </span>
              {point.href && (
                <a 
                  href={point.href}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {point.href}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const SectionComponent = ({ 
  section, 
  level = 1,
  isNested = false
}: { 
  section: Section
  level?: number
  isNested?: boolean
}) => {
  return (
    <>
      <SectionContent section={section} level={level} />
      
      {Object.entries(section).map(([key, value]) => {
        if (key.startsWith('section-') && typeof value === 'object') {
          const nestedSection = value as Section
          return (
            <div key={key} className={!isNested ? "mt-12" : ""}>
              {nestedSection.href ? (
                <a 
                  href={nestedSection.href}
                  className="block hover:opacity-90 transition-opacity"
                >
                  <SectionComponent
                    section={nestedSection}
                    level={Math.min(level + 1, 6)}
                    isNested={true}
                  />
                </a>
              ) : (
                <SectionComponent
                  section={nestedSection}
                  level={Math.min(level + 1, 6)}
                  isNested={true}
                />
              )}
            </div>
          )
        }
        return null
      })}
    </>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SectionComponent section={content['section-1']} />
    </main>
  )
}