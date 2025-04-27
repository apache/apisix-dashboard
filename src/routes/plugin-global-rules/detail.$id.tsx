import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/plugin-global-rules/detail/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/plugin-global-rules/detail/$id"!</div>
}
