<template>
    <div class="p-6 pt-0 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <label class="text-sm font-medium leading-none">First Name</label>
                <input
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm"
                    placeholder="Enter your first name"
                    :value="form.first_name"
                    @input="updateField('first_name', $event.target.value)">
            </div>
            <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Last Name</label>
                <input
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm"
                    placeholder="Enter your last name"
                    :value="form.last_name"
                    @input="updateField('last_name', $event.target.value)">
            </div>
        </div>

        <div class="space-y-2">
            <label class="text-sm font-medium leading-none">Email Address</label>
            <input
                type="email"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm"
                placeholder="Enter your email address"
                :value="form.email"
                @input="updateField('email', $event.target.value)">
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Mobile Number</label>
                <input
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm"
                    placeholder="Enter your mobile number"
                    :value="form.mobile"
                    @input="updateField('mobile', $event.target.value)">
            </div>
            <div class="space-y-2 flex flex-col">
                <label class="text-sm font-medium leading-none">Date of Birth</label>
                <input
                    type="date"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm"
                    :value="form.date_of_birth"
                    @input="updateField('date_of_birth', $event.target.value)">
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <label class="text-sm font-medium leading-none">University Name</label>
                <input
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm"
                    placeholder="Enter your university name"
                    :value="form.university_name"
                    @input="updateField('university_name', $event.target.value)">
            </div>
            <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Nationality</label>
                <input
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm"
                    placeholder="Enter your nationality"
                    :value="form.nationality"
                    @input="updateField('nationality', $event.target.value)">
            </div>
        </div>

        <div class="space-y-2">
            <label class="text-sm font-medium leading-none">Address</label>
            <textarea
                class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Enter your full address"
                @input="updateField('address', $event.target.value)">{{ form.address }}</textarea>
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
                first_name    : '',
                last_name     : '',
                email         : '',
                mobile        : '',
                date_of_birth : '',
                university_name: '',
                nationality   : '',
                address       : '',
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
