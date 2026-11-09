// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

function props(): any {
  const t = (key: string) => key
  return {
    node: {
      data: {
        blocks: [{ kind: 'reasoning', text: 'thinking' }],
        status: 'running',
      },
      location: { kind: 'turn', turn: { status: 'open' } },
    },
    useTurnData: () => undefined,
    openFile: () => {},
    loadImage: async () => '',
    fileMentions: () => undefined,
    t,
  }
}

async function loadView(icons: Record<string, unknown>) {
  vi.resetModules()
  vi.doMock('@deepseek-ai/dsh-client-ui-primitives', () => ({
    DisclosureRow: ({ icon, children }: { icon?: ReactNode; children?: ReactNode }) => (
      <div>{icon}{children}</div>
    ),
    JsonBlock: () => null,
    ...icons,
  }))
  const module = await import('../src/client/renderer.tsx')
  return module.BetterAssistantNodeView
}

afterEach(() => {
  vi.doUnmock('@deepseek-ai/dsh-client-ui-primitives')
  vi.resetModules()
})

describe('think icon compatibility', () => {
  it('uses IconThinkOutlineRegular when the old IconThinkOutline14 is absent', async () => {
    const View = await loadView({
      IconThinkOutlineRegular: () => <span data-testid="regular-icon" />,
    })
    render(<View {...props()} />)
    expect(screen.getByTestId('regular-icon')).toBeTruthy()
  })

  it('falls back to IconThinkOutlineMedium when Regular is absent', async () => {
    const View = await loadView({
      IconThinkOutlineMedium: () => <span data-testid="medium-icon" />,
    })
    render(<View {...props()} />)
    expect(screen.getByTestId('medium-icon')).toBeTruthy()
  })

  it('renders a neutral placeholder when no think icon is exported', async () => {
    const View = await loadView({})
    const view = render(<View {...props()} />)
    expect(view.container.querySelector('span[aria-hidden="true"]')).not.toBeNull()
  })
})
