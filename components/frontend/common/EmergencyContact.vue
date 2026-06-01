<template>
    <div class="p-6 pt-0 space-y-4">
        <div class="space-y-2">
            <label class="text-sm font-medium leading-none">Emergency Contact Name</label>
            <input
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm"
                placeholder="Enter emergency contact name"
                :value="form.name"
                @input="updateField('name', $event.target.value)">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Emergency Contact Phone</label>
                <input
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm"
                    placeholder="Enter emergency contact phone"
                    :value="form.phone"
                    @input="updateField('phone', $event.target.value)">
            </div>
            <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Relation</label>
                <input
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm"
                    placeholder="e.g., Parent, Sibling, Friend"
                    :value="form.relation"
                    @input="updateField('relation', $event.target.value)">
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            type   : Object,
            default: () => ({}),
        },
    },
    computed: {
        form() {
            return {
                name    : '',
                phone   : '',
                relation: '',
                ...this.value,
            };
        },
    },
    methods: {
        updateField(field, fieldValue) {
            this.$emit('input', {
                ...this.form,
                [field]: fieldValue,
            });
        },
    },
};
</script>
