import { FieldHookConfig, useField } from 'formik';
import styled from 'styled-components';

const StyledErrorMessage = styled.div`
	font-size: 12px;
	color: #e03131;
	margin-bottom: 5px;
	font-weight: 500;
`;

const TextInput = ({ ...props }: FieldHookConfig<string>) => {
	const [field, meta] = useField(props);

	return (
		<div>
			<input
				className={
					meta.touched && meta.error ? 'login__input invalid' : 'login__input'
				}
				{...field}
				{...(props as unknown)}
			/>{' '}
			{meta.touched && meta.error ? (
				<StyledErrorMessage>{meta.error}</StyledErrorMessage>
			) : null}
		</div>
	);
};

export default TextInput;
