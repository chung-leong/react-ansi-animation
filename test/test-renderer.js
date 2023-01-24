export async function withTestRenderer(cb) {
  const { create, act } = await import('react-test-renderer');
  let renderer;
  try {
    await cb({
      render: (el) => act(() => renderer = create(el)),
      update: (el) => act(() => renderer.update(el)),
      unmount: () => act(() => renderer.unmount()),
      toJSON: () => renderer.toJSON(),
      act,
    });
  } finally {
    if (renderer) {
      renderer.unmount();
    }
  }
}
