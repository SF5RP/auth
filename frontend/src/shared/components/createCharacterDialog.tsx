"use client";

import type { ComponentPropsWithoutRef } from "react";
import styled from "@emotion/styled";
import { useForm } from "react-hook-form";
import { Card, CardTitle, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import type { CreateCharacterFormData } from "@/shared/types/characterForm";

interface CreateCharacterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCharacterFormData) => void;
  serverId: number;
  initialValues?: Partial<CreateCharacterFormData>;
  title?: string;
  submitLabel?: string;
}

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${(props) => (props.isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const DialogCard = styled(Card)`
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #e9ecef;
  font-weight: 600;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: #1a1d29;
  color: #e9ecef;
  font-size: 16px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #5562e0;
  }

  &::placeholder {
    color: #6b7280;
  }
`;

const NumberInputBase = styled(Input)`
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

function NumberInput(props: ComponentPropsWithoutRef<"input">) {
  return <NumberInputBase {...props} type="number" />;
}

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  background: #1a1d29;
`;

const CheckboxBase = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #5562e0;
`;

function Checkbox(props: ComponentPropsWithoutRef<"input">) {
  return <CheckboxBase {...props} type="checkbox" />;
}

const CheckboxLabel = styled.label`
  color: #e9ecef;
  font-size: 14px;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
`;

export function CreateCharacterDialog({
  isOpen,
  onClose,
  onSubmit,
  // serverId is not used directly in this dialog, consumed by parent handlers

  initialValues,
  title = "Создать нового персонажа",
  submitLabel = "Создать персонажа",
}: CreateCharacterDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCharacterFormData>({
    defaultValues: {
      name: "",
      level: 1,
      cash: 0,
      bank: 0,
      apartment: { has_apartment: false },
      house: { has_house: false },
      pet: { has_pet: false },
      laboratory: { has_laboratory: false },
      medical_card: { has_medical_card: false },
      vip_status: { has_vip_status: false },
      ...initialValues,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: CreateCharacterFormData) => {
    onSubmit(data);
    handleClose();
  };

  if (!isOpen) return null;

  // react-hook-form's handleSubmit returns a Promise-returning handler; wrap with void
  const onSubmitForm = handleSubmit(handleFormSubmit);

  return (
    <Overlay isOpen={isOpen} onClick={handleClose}>
      <DialogCard onClick={(e) => e.stopPropagation()}>
        <CardTitle>{title}</CardTitle>
        <CardContent>
          <Form onSubmit={(e) => void onSubmitForm(e)}>
            <FormGroup>
              <Label htmlFor="name">Имя персонажа</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Имя обязательно для заполнения",
                })}
                placeholder="Введите имя персонажа"
              />
              {errors.name && (
                <ErrorMessage>{errors.name.message}</ErrorMessage>
              )}
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label htmlFor="level">Уровень</Label>
                <NumberInput
                  id="level"
                  {...register("level", {
                    required: "Уровень обязателен",
                    min: { value: 1, message: "Минимальный уровень: 1" },
                  })}
                  min="1"
                />
                {errors.level && (
                  <ErrorMessage>{errors.level.message}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="cash">Наличные</Label>
                <NumberInput
                  id="cash"
                  {...register("cash", {
                    required: "Сумма обязательна",
                    min: {
                      value: 0,
                      message: "Сумма не может быть отрицательной",
                    },
                  })}
                  min="0"
                />
                {errors.cash && (
                  <ErrorMessage>{errors.cash.message}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="bank">Банк</Label>
                <NumberInput
                  id="bank"
                  {...register("bank", {
                    required: "Сумма обязательна",
                    min: {
                      value: 0,
                      message: "Сумма не может быть отрицательной",
                    },
                  })}
                  min="0"
                />
                {errors.bank && (
                  <ErrorMessage>{errors.bank.message}</ErrorMessage>
                )}
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Статусы</Label>
              <CheckboxGroup>
                <CheckboxItem>
                  <Checkbox {...register("apartment.has_apartment")} />
                  <CheckboxLabel>Квартира</CheckboxLabel>
                </CheckboxItem>
                <CheckboxItem>
                  <Checkbox {...register("house.has_house")} />
                  <CheckboxLabel>Дом</CheckboxLabel>
                </CheckboxItem>
                <CheckboxItem>
                  <Checkbox {...register("pet.has_pet")} />
                  <CheckboxLabel>Животное</CheckboxLabel>
                </CheckboxItem>
                <CheckboxItem>
                  <Checkbox {...register("laboratory.has_laboratory")} />
                  <CheckboxLabel>Лаборатория</CheckboxLabel>
                </CheckboxItem>
                <CheckboxItem>
                  <Checkbox {...register("medical_card.has_medical_card")} />
                  <CheckboxLabel>Медкарта</CheckboxLabel>
                </CheckboxItem>
                <CheckboxItem>
                  <Checkbox {...register("vip_status.has_vip_status")} />
                  <CheckboxLabel>VIP</CheckboxLabel>
                </CheckboxItem>
              </CheckboxGroup>
            </FormGroup>

            <ButtonGroup>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Отмена
              </Button>
              <Button type="submit">{submitLabel}</Button>
            </ButtonGroup>
          </Form>
        </CardContent>
      </DialogCard>
    </Overlay>
  );
}
