"use client";

import { Trash2 } from "lucide-react";
import { deleteArticle } from "@/app/redaktion/actions";

export function DeleteArticleButton({ id, slug }: { id: string; slug: string }) {
  return (
    <form
      action={deleteArticle}
      onSubmit={(event) => {
        if (!window.confirm("Vill du verkligen radera artikeln permanent?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="slug" value={slug} />
      <button type="submit"><Trash2 /> Radera</button>
    </form>
  );
}
