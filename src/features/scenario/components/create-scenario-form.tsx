import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateScenario } from "@/features/scenario/hooks/use-scenarios";
import {
  createScenarioSchema,
  type CreateScenarioInput,
} from "@/features/scenario/types/schema";

export function CreateScenarioForm({ onDone }: { onDone: () => void }) {
  const createScenario = useCreateScenario();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateScenarioInput>({
    resolver: zodResolver(createScenarioSchema),
  });

  const onSubmit = (values: CreateScenarioInput) => {
    createScenario.mutate(values, {
      onSuccess: () => {
        toast.success("Scenario created");
        reset();
        onDone();
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg border border-border p-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Should I Learn AI?"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={3}
          placeholder="I'm in my final semester. Need a job. Should I focus on AI or Frontend?"
          className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          {...register("description")}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="goal">Goal</Label>
        <Input
          id="goal"
          placeholder="Become Software Engineer"
          {...register("goal")}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" isLoading={createScenario.isPending}>
          Create scenario
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
