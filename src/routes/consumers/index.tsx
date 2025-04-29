import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/consumers/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/consumer/"!</div>
}
