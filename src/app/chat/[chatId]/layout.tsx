type Props = {
  children: React.ReactNode;
  // params: { chatId: string };
};

function DocEditorLayout({ children }: Props) {
  return (
    <div className="w-full">
      <div className="fixed right-2 top-1 z-50"></div>
      {children}
    </div>
  );
}

export default DocEditorLayout;
