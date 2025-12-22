import React, { Component } from "react";
import { storyblokEditable, StoryblokComponent } from "@storyblok/react";
import css from "./OneCol.module.scss";


export default class OneCol extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<>
				<section {...storyblokEditable(this.props.blok)} className={css["cols"]}>
					<div className={css["colone"]}>
						{this.props.blok.colone.map((nestedBlok) => (
							<StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
						))}
					</div>
				</section>
			</>
		);
	}
}