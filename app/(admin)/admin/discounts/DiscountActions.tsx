'use client';

export function CreateOfferButton() {
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '10px 20px',
        borderRadius: 100,
        background: '#C9A84C',
        color: '#1C1208',
        border: 'none',
        cursor: 'pointer',
      }}
      onClick={() => alert('TODO: Create offer form')}
    >
      + Create Offer
    </button>
  );
}

export function EditDiscountButton() {
  return (
    <button
      style={{
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontWeight: 500,
        padding: '5px 12px',
        borderRadius: 4,
        border: '1px solid rgba(201,168,76,.4)',
        color: '#8a6d2a',
        background: 'rgba(201,168,76,.06)',
        cursor: 'pointer',
      }}
      onClick={() => alert('TODO: Edit discount form')}
    >
      Edit
    </button>
  );
}
