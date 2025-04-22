import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/plugin-global-rules/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/plugin-global-rules/"!</div>
}
