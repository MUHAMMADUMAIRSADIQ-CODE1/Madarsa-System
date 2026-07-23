export default function TabPlaceholder({ title, description, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-border-light p-8 sm:p-12 text-center">
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/5 rounded-2xl flex items-center justify-center">
          <Icon className="w-8 h-8 text-primary/40" />
        </div>
      )}
      <h3 className="font-heading text-xl font-bold text-text-dark mb-2">{title}</h3>
      <p className="text-text-light max-w-md mx-auto text-sm">
        {description || 'This section is coming soon. Stay tuned for updates.'}
      </p>
    </div>
  );
}
